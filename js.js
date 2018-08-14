(function() {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    {
        // initialize garbage->symbol mapping,
        // with index being symbol type,
        // e.g. nuisance-type-0 is class name for comet symbol
        var garbageMap = new Array(7);
        garbageMap[6] = 1;
        garbageMap[5] = garbageMap[6] * 6;
        garbageMap[4] = garbageMap[5] * 5;
        garbageMap[3] = garbageMap[4] * 6;
        garbageMap[2] = garbageMap[3] * 2;
        garbageMap[1] = garbageMap[2] * 2;
        garbageMap[0] = garbageMap[1] * 2;
    }

    {
        // initialize sound effect->garbage mapping,
        // with index being sound effect type,
        // value is the minimum required to trigger the corresponding sound fx
        // e.g. #sound-fx-type-0 is the sound fx file for strongest attack
        // 
        // to be overridden by custom fields
        var soundFxMap = [20, 16, 8, 4, 1];
        var soundFxVolume = 0;
    }

    {
        // TODO: allow customizing color of counter effect
        var counterFxColors = ['white'];
    }

    {
        var timingFieldsMapping = {
            'attackFxDelay' : 'counter_effect_delay',
            'soundFxDelay'  : 'sound_effect_delay',
            'symbolUpdateDelay' : 'nuisance_icon_update_delay',
        }
        var timing = {};
    }

    function populateCustomFields(fields) {
        // range(n) => [0, 1, ..., n - 1] 
        let range = end => Array.from(Array(end)).map((_, idx) => idx);
        // map({ 'foo' : 'bar', 'foobar' : 'barfoo' }) => { 'foo' : fields['bar'].value, 'foobar' : fields['barfoo'].value }
        let map = mapping => Object.keys(mapping).reduce((obj, elm) => (obj[elm] = fields[mapping[elm]].value, obj), {});
        
        soundFxMap = range(soundFxMap.length).map(n => fields['minimum_damage_' + n].value);
        soundFxVolume = fields['sound_fx_volume'].value;
        timing = map(timingFieldsMapping);
    }

    function updateSymbols(nuisanceCount) {
        $('.nuisance > div').each(function() {
            let $this = $(this).removeClass();
            
            if (nuisanceCount == 0) {
                return;
            }

            for (let type = 0; type < garbageMap.length; ++type) {
                let symbolRepr = garbageMap[type];
                if (nuisanceCount >= symbolRepr) {
                    $this.addClass('nuisance-type-' + type);
                    nuisanceCount -= symbolRepr;
                    return;
                }
            }
        });
    }

    function displayQueueRecalcAnimation() {
        // removing .animate since there could be ongoing animations,
        // and we want to just stop that and start over
        let $nuisanceQueue = $('#nuisance_queue').removeClass('animate');
        
        // trigger reflows, without this adding class right after removing won't work
        $nuisanceQueue[0].offsetWidth;

        $nuisanceQueue.addClass('animate');
    }
    
    function playDamageSoundEffect(damage) {
        let soundId = soundFxMap.findIndex(min => damage >= min);
        if (soundId !== -1) {
            // soundId can be undefined(not found) if damage is not worth playing a sound,
            // that is, when damage < minimum minimum
            
            // cloning to allow overlapping sound effects
            let audioElm = $('audio[id^=sound-fx-type-]')[soundId].cloneNode(true);
            audioElm.volume = soundFxVolume;
            audioElm.play();
        }
    }

    function displayAttackEffect() {
        let $nuisanceEffect = $('<div></div>')
            .addClass('nuisance_effect')
            .append(['ring', 'blast', 'confetti']
                        .map(className => $('<div></div>')
                                            .addClass([className, 'animate'].join(' '))
                                            .css({ 'background-color' : counterFxColors[0] })
                   )
            )
            .appendTo($('#wrap'));

        // remove effect elements whose animations have completed
        delay(1500).then(() => $nuisanceEffect.remove());
    }

    function recalculate(prevCount, currCount) {
        delay(0).then(displayQueueRecalcAnimation);
        let damage = prevCount - currCount;
        if (prevCount != 0 && damage != 0) {
            delay(timing.attackFxDelay).then(() => displayAttackEffect(damage));
            delay(timing.soundFxDelay).then(() => playDamageSoundEffect(damage));
        }
        delay(timing.symbolUpdateDelay).then(() => updateSymbols(currCount));
    }

    let currentHealth = 0;
    document.addEventListener('bossLoad', 
        bossInfo => populateCustomFields(bossInfo.detail.settings.custom_json)
    );
    document.addEventListener('bossLoad', 
        bossInfo => recalculate(0, currentHealth = +bossInfo.detail.current_health)
    );
    document.addEventListener('bossDamaged',
        bossInfo => recalculate(currentHealth, currentHealth = bossInfo.detail.boss.current_health)
    );
    document.addEventListener('bossKilled',
        bossInfo => recalculate(currentHealth, currentHealth = bossInfo.detail.boss.current_health)
    );

})();

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
        var soundFxMap = [20, 16, 8, 4, 1];
    }

    {
        var counterFxColors = ['red', 'orange', 'green', 'blue', 'purple'];
    }

    {
        var customSettings = {};
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
        
        delay(1).then(() => $nuisanceQueue.addClass('animate'));
    }
    
    function playDamageSoundEffect(damage) {
        let soundId = soundFxMap.findIndex(min => damage >= min);
        if (soundId !== undefined) {
            // soundId can be undefined(not found) if damage is not worth playing a sound,
            // that is, when damage < minimum minimum
            
            // cloning to allow overlapping sound effects
            let audioElm = $('audio[id^=sound-fx-type-]')[soundId].cloneNode(true);
            audioElm.volume = 0.3;
            audioElm.play();
        }
    }

    function displayAttackEffect() {
        let $nuisanceEffect = $('<div></div>')
            .addClass('nuisance_effect')
            .append(['ring', 'blast', 'confetti']
                        .map(className => $('<div></div>')
                                            .addClass([className, 'animate'])
                                            .css({ 'background-color' : counterFxColors[0] })
                   )
            )
            .appendTo($('#wrap'));

        // remove effect elements whose animations have completed
        delay(1500).then(() => $nuisanceEffect.remove());
    }

    function recalculate(prevCount, currCount) {
        delay(0).then(() => displayQueueRecalcAnimation());
        let damage = currCount - prevCount;
        if (damage != 0) {
            delay(160).then(() => displayAttackEffect(damage));
            delay(80).then(() => playDamageSoundEffect(damage));
        }
        delay(150).then(() => updateSymbols(currCount));
    }

    let currentHealth = 0;
    document.addEventListener('bossLoad', 
        bossInfo => customSettings = bossInfo.detail.settings.custom_json
    );
    document.addEventListener('bossLoad', 
        bossInfo => recalculate(0, currentHealth = bossInfo.detail.current_health)
    );
    document.addEventListener('bossDamaged',
        bossInfo => recalculate(currentHealth, currentHealth = bossInfo.detail.current_health)
    );
    document.addEventListener('bossKilled',
        bossInfo => recalculate(currentHealth, currentHealth = bossInfo.detail.current_health)
    );

})();

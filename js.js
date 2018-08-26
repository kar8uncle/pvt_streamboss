(function() {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    {
        // character animation DOM elements
        var animationTree = {
            'pvt_amitie' : $('<div></div>').addClass(['spell', 'pvt', 'amitie'].join(' '))
                           .append($('<div></div>').addClass('starry-sky')
                                  .append($('<div></div>').addClass('stars-1').css({ 'width': '3px', 'height': '3px' }))
                                  .append($('<div></div>').addClass('stars-2').css({ 'width': '1px', 'height': '1px' }))
                          ).append($('<div></div>').addClass('contained-wrapper')
                                  .append($('<div></div>').addClass('contained')
                                          .append($('<div></div>').addClass('character')
                                                  .append([['face', 'state-0'], 
                                                           ['face', 'state-1'],
                                                           ['right-hand', 'state-1'],
                                                           ['left-hand', 'state-1'],
                                                           ['flowers'],
                                                           ['right-hand', 'state-0'],
                                                           ['left-hand', 'state-0'],
                                                          ].map(cls => $('<img>').addClass(cls.join(' '))))
                                          )
                                 )
                          ).append(['outer-magic-circle', 'inner-magic-circle'].map(cls => $('<img>').addClass(cls))),
        };
    }

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

    {
        var nuisanceStyle = 'puyo';
    }

    {
        var bossKillAnimationKey = '';
    }

    function populateCustomFields(fields) {
        // range(n) => [0, 1, ..., n - 1] 
        let range = end => Array.from(Array(end), (_, idx) => idx);
        // map({ 'foo' : 'bar', 'foobar' : 'barfoo' }) => { 'foo' : fields['bar'].value, 'foobar' : fields['barfoo'].value }
        let map = mapping => Object.keys(mapping).reduce((obj, elm) => (obj[elm] = fields[mapping[elm]].value, obj), {});
        
        soundFxMap = range(soundFxMap.length).map(n => fields['minimum_damage_' + n].value);
        soundFxVolume = fields['sound_fx_volume'].value;
        timing = map(timingFieldsMapping);
        nuisanceStyle = fields['nuisance_icon_style'].value;
        bossKillAnimationKey = fields['boss_kill_animation'].value;
    }

    function updateSymbols(nuisanceCount) {
        $('.nuisance > img').each(function() {
            let $this = $(this).removeClass();
            
            if (nuisanceCount == 0) {
                return;
            }

            for (let type = 0; type < garbageMap.length; ++type) {
                let symbolRepr = garbageMap[type];
                if (nuisanceCount >= symbolRepr) {
                    $this.addClass(['nuisance-type-' + type, nuisanceStyle].join(' '));
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
        let $nuisanceEffect = $('<div/>')
            .addClass('nuisance_effect')
            .append(['ring', 'blast', 'confetti']
                        .map(className => $('<div/>')
                                            .addClass([className, 'animate'].join(' '))
                                            .append($('<img>').addClass(className))
                        )
            )
            .appendTo($('#wrap'));

        // remove effect elements whose animations have completed
        delay(1500).then(() => $nuisanceEffect.remove());
    }

    function recalculate(prevOverride, currOverride) {
        let prev = prevOverride !== undefined ? prevOverride : prevCount;
        let curr = currOverride !== undefined ? currOverride : currCount;
        delay(0).then(displayQueueRecalcAnimation);
        let damage = prev - curr;
        if (damage > 0) {
            delay(timing.attackFxDelay).then(() => displayAttackEffect(damage));
            delay(timing.soundFxDelay).then(() => playDamageSoundEffect(damage));
        }
        return delay(timing.symbolUpdateDelay).then(() => updateSymbols(curr));
    }

    function populate() {
        let $generateFx = $('<div/>').addClass('generate_fx').append(
            $('<div/>').addClass('cloud').append(
                $('<div/><div/><div/><div/>')
            ).append(
                $('<div/><div/>').addClass('dark')
            )
        ).append(
            $('<div/>').addClass('fire').append(
                $('<div/><div/>')
            )
        );

        let $generate = $('<div/>').addClass('generate').append(
            Array.from(Array(6), () => $generateFx.clone())
        ).appendTo($('.queue_wrapper'));

        let audioElm = $('#sound-fx-nuisance-generate')[0].cloneNode(true);
        audioElm.volume = soundFxVolume;
        audioElm.play();

        return delay(200).then(() => recalculate())
                         .then(() => delay(600))
                         .then(() => $generate.remove());
    }

    function updateCount(newCount) {
        if (!willRecalc) {
            prevCount = currCount;
        }
        currCount = newCount;
    }

    function loadBoss(health) {
        updateCount(health);
        if (willRecalc) {
            return;
        }

        willRecalc = true;
        delay(0).then(populate)
                .then(() => willRecalc = false);
    }

    function damageBoss(newHealth) {
        updateCount(newHealth);
        if (willRecalc) {
            return;
        }
        
        willRecalc = true;
        delay(0)
            .then(() => recalculate())
            .then(() => willRecalc = false);
    }

    function killBoss(nextHealth) {
        // store the prev count in case another event comes and messes with it
        var prev = prevCount;
        updateCount(0);

        if (willRecalc) {
            return;
        }

        willRecalc = true;

        let animationPromise;
        if (bossKillAnimationKey) {
            let $treeClone = animationTree[bossKillAnimationKey].clone().appendTo($('#main'));
            animationPromise = delay(4000).then(() => $treeClone.remove());
        } else {
            animationPromise = delay(0);
        }

        animationPromise.then(() => recalculate(prev, 0))
                        .then(() => delay(2000))
                        .then(() => currCount == 0 ? updateCount(nextHealth) : null)
                        .then(populate)
                        .then(() => willRecalc = false);
    }

    let prevCount = 0;
    let currCount = 0;
    let willRecalc = false;

    document.addEventListener('bossLoad', 
        bossInfo => populateCustomFields(bossInfo.detail.settings.custom_json)
    );
    document.addEventListener('bossLoad', 
        bossInfo => loadBoss(+bossInfo.detail.current_health)
    );
    document.addEventListener('bossDamaged',
        bossInfo => damageBoss(+bossInfo.detail.boss.current_health)
    );
    document.addEventListener('bossKilled',
        bossInfo => killBoss(+bossInfo.detail.boss.current_health)
    );

})();

import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatDurationMillisMinSec } from 'common/format';

/**
 * Grenade Juggler reduces the remaining cooldown on Wildfire Bomb by 2.0 sec on Explosive Shot cast.
 *
 * Example logs:
 * https://www.warcraftlogs.com/reports/1c9HdABGLYnNXFjP#fight=31&type=casts&source=17&ability=212431
 */

class GrenadeJuggler extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private reductionAtCurrentCast: number = 0;
  private effectiveReductionMs: number = 0;
  private wastedReductionMs: number = 0;
  private autoAttack: number = 0;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.GRENADE_JUGGLER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EXPLOSIVE_SHOT_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.reductionAtCurrentCast += 2;
    if (this.spellUsable.isOnCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id)) {
      this.checkCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id);
    } else {
      this.wastedReductionMs += 2000;
    }
    this.autoAttack += 1;
  }

  checkCooldown(spellId: number) {
    if (this.spellUsable.cooldownRemaining(spellId) < 2000) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, 2000);
      this.effectiveReductionMs += effectiveReductionMs;
      this.wastedReductionMs += 2000 - effectiveReductionMs;
    } else {
      this.effectiveReductionMs += this.spellUsable.reduceCooldown(spellId, 2000);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.GRENADE_JUGGLER_TALENT}>
          <>
            {formatDurationMillisMinSec(this.effectiveReductionMs)}{' '}
            <small>cooldown reduction.</small>
            <br />
            {formatDurationMillisMinSec(this.wastedReductionMs)} <small>wasted.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GrenadeJuggler;

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isFromMistyPeaks } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

class DancingMists extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };
  hotTracker!: HotTrackerMW;
  dancingMistCount: number = 0;
  dancingMistHealing: number = 0;
  dancingMistAbsorbed: number = 0;
  dancingMistOverhealing: number = 0;
  dancingMistVivifyCleaveHits: number = 0;
  dancingMistMistyPeaksProcs: number = 0;
  extraVivCleaves: number = 0;
  extraVivHealing: number = 0;
  extraVivOverhealing: number = 0;
  extraVivAbsorbed: number = 0;
  extraMistyPeaksProcs: number = 0;
  countedMainVivifyHit: boolean = false;
  lastVivifyCastTarget: number = 0;
  extraMistyPeaksHealing: number = 0;
  extraMistyPeaksAbsorb: number = 0;

  get totalHealing() {
    return this.dancingMistReMHealing + this.dancingMistVivifyHealing;
  }
  get dancingMistReMHealing() {
    return this.dancingMistHealing + this.dancingMistAbsorbed;
  }

  get dancingMistVivifyHealing() {
    return this.extraVivHealing + this.extraVivAbsorbed;
  }

  get mistyPeaksHealingFromDancingMist() {
    return this.extraMistyPeaksHealing + this.extraMistyPeaksAbsorb;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onReMHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleVivify);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY),
      this.handleVivifyCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onEnvHeal,
    );
  }

  onApplyRem(event: ApplyBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromDancingMists(hot) && !this.hotTracker.fromBounce(hot)) {
      this.dancingMistCount += 1;
    }
  }

  onReMHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromDancingMists(hot)) {
      this.dancingMistHealing += event.amount || 0;
      this.dancingMistAbsorbed += event.absorbed || 0;
      this.dancingMistOverhealing += event.overheal || 0;
    }
  }
  handleVivifyCast(event: CastEvent) {
    this.lastVivifyCastTarget = event.targetID || 0;
    this.countedMainVivifyHit = false;
  }

  handleVivify(event: HealEvent) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    // only count cleave hit on main target
    if (targetId === this.lastVivifyCastTarget && !this.countedMainVivifyHit) {
      this.countedMainVivifyHit = true;
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromRapidDiffusion(hot)) {
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
    }
  }

  handleEnvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromDancingMists(hot)) {
      if (isFromMistyPeaks(event)) {
        this.extraMistyPeaksProcs += 1;
      }
    }
  }
  onEnvHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const remhot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    if (this.hotTracker.fromDancingMists(remhot)) {
      if (
        !this.hotTracker.hots[playerId] ||
        !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
      ) {
        return;
      }
      const hot = this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
      if (this.hotTracker.fromMistyPeaks(hot)) {
        this.extraMistyPeaksHealing += event.amount || 0;
        this.extraMistyPeaksAbsorb += event.absorbed || 0;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
              <li>
                Extra <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id} /> procs:{' '}
                {formatNumber(this.extraMistyPeaksProcs)}
              </li>
            )}
            {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
              <li>
                Extra <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id} /> healing:{' '}
                {formatNumber(this.mistyPeaksHealingFromDancingMist)}
              </li>
            )}
            <li>
              Extra <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> direct healing:{' '}
              {formatNumber(this.dancingMistReMHealing)}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> cleaves: {this.extraVivCleaves}
            </li>
            <li>
              Extra <SpellLink id={SPELLS.VIVIFY.id} /> healing:{' '}
              {formatNumber(this.extraVivHealing)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.DANCING_MISTS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <>
                The number of additional <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} />s
                procced on casts and jumps
              </>
            }
          >
            {this.dancingMistCount}{' '}
            <small>
              duplicated <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} />
            </small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DancingMists;

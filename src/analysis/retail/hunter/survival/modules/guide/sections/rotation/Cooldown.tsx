import { GuideProps, Section } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';

export default function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <Section title="Cooldowns">
      <p>
        These cooldowns are essential for maximizing your damage output.
        <SpellLink spell={TALENTS.COORDINATED_ASSAULT_TALENT} />, and{' '}
        <SpellLink spell={TALENTS.SPEARHEAD_TALENT} /> should be layered together whenever possible
        to maximise damage in Single Target. If using{' '}
        <SpellLink spell={TALENTS.SENTINEL_WATCH_TALENT} /> then do not delay either cooldown for
        the other. If using <SpellLink spell={TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT} /> then
        ensure every other cast of Spearhead is right away in order to keep the cooldowns lined up.
        Keep in mind that the cast efficiency does not take into account fight timings, or specific
        strategies that may require you to hold cooldowns.
      </p>
      <div>
        Legend
        <ul>
          <li>Gray - Spell was available</li>
          <li>Yellow - Spell was on cooldown</li>
        </ul>
      </div>
      <CastEfficiencyBar
        spellId={TALENTS.COORDINATED_ASSAULT_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        slimLines
        useThresholds
      />
      {info.combatant.hasTalent(TALENTS.SPEARHEAD_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS.SPEARHEAD_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
    </Section>
  );
}

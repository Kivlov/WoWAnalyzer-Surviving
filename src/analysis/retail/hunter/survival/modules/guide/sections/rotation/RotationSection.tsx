import { t, Trans } from '@lingui/macro';
import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import TALENTS from 'common/TALENTS/hunter';
import * as AplCheck from 'analysis/retail/hunter/survival/modules/apl/AplCheck';
import { AplSectionData } from 'interface/guide/components/Apl';
export default function RotationSection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.survival.sections.rotation.title',
        message: 'Rotation',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.survival.sections.rotation.core.title',
          message: 'Core Rotation',
        })}
      >
        {modules.raptorStrike.guideSubsection}
      </SubSection>

      <SubSection
        title={t({
          id: 'guide.hunter.survival.sections.rotation.rotationalcooldowns.title',
          message: 'Rotational Cooldowns',
        })}
      >
        <Trans id="guide.hunter.survival.sections.rotation.core.graph">
          <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how
          long you waited to use them again. Grey segments show when the spell was available, yellow
          segments show when the spell was cooling down. Red segments highlight times when you could
          have fit a whole extra use of the cooldown.
        </Trans>
        {modules.wildfireBomb.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT) &&
          modules.flankingStrike.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT) &&
          modules.butchery.guideSubsection}
        {modules.explosiveShot.guideSubsectionSV}
        {modules.killShot.guideSubsectionSV}
      </SubSection>

      <SubSection title="APL Analysis">
        <AplSectionData checker={AplCheck.checkApl} apl={AplCheck.apl} />
      </SubSection>
    </Section>
  );
}

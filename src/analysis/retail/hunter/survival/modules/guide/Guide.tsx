import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../../CombatLogParser';
import ResourceUseSection from './sections/resources/ResourceUseSection';
import RotationSection from './sections/rotation/RotationSection';
import ActiveTime from './sections/rotation/ActiveTime';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ActiveTime modules={modules} events={events} info={info} />
      <ResourceUseSection {...modules} />
      <RotationSection modules={modules} events={events} info={info} />

      <PreparationSection />
    </>
  );
}

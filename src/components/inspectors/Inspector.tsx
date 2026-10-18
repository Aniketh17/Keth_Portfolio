import type { Project } from '../../data/types';
import { LiveDemo } from '../../mock/LiveDemo';
import { ProjectArtifact } from '../Artifact';
import { ImacInspector } from './Imac';
import { JourneyInspector } from './Journey';
import type { InspectorProps } from './shared';

/** Each project gets the inspection that suits its real evidence; a project without one falls back to its flow. */
export function Inspector({ project, ...props }: InspectorProps & { project: Project }) {
  switch (project.id) {
    case 'imac-advisor':
      return <ImacInspector {...props} />;
    case 'fit-check':
      return <LiveDemo demo="fit" />;
    case 'transaction-coding':
      return <LiveDemo demo="transactions" />;
    case 'tiny-paws':
      return <JourneyInspector {...props} />;
    default:
      return <ProjectArtifact project={project} />;
  }
}

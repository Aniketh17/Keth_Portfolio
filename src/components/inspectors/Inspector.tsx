import type { Project } from '../../data/types';
import { ProjectArtifact } from '../Artifact';
import { FitInspector } from './Fit';
import { ImacInspector } from './Imac';
import { JourneyInspector } from './Journey';
import type { InspectorProps } from './shared';
import { TriageInspector } from './Triage';

/** Each project gets the inspection that suits its real evidence; a project without one falls back to its flow. */
export function Inspector({ project, ...props }: InspectorProps & { project: Project }) {
  switch (project.id) {
    case 'imac-advisor':
      return <ImacInspector {...props} />;
    case 'fit-check':
      return <FitInspector {...props} />;
    case 'transaction-coding':
      return <TriageInspector {...props} />;
    case 'tiny-paws':
      return <JourneyInspector {...props} />;
    default:
      return <ProjectArtifact project={project} />;
  }
}

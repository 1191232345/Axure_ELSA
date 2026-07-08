import type { PrototypeDesign } from './prototypeDesign';

export interface PrototypeTemplateSummary {
  id: string;
  name: string;
  description: string;
  system: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PrototypeTemplateDetail extends PrototypeTemplateSummary {
  design: PrototypeDesign;
}

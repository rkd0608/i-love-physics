export interface AnatomyPart {
  tex: string;
  label?: string;
  meaning?: string;
  value?: string;
  unit?: string;
  glue?: boolean;
}

export type TopicAnatomy = Record<number, AnatomyPart[]>;

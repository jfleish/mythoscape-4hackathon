export interface Passage {
  passageId: string;
  title: string;
  text: string;
  originalText?: string;
  originalLabel?: string;
  audioUrl: string | null;
  startTimeMs: number;
  endTimeMs: number;
}

export interface BookMeta {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl: string;
  description: string;
  modelUrl: string | null;
  spineColor: string;
  passages: Passage[];
  cameraSpawn: {
    position: [number, number, number];
    target: [number, number, number];
  };
  cameraOrbit?: {
    center: [number, number, number];
    radiusX: number;
    radiusZ: number;
    heightBase: number;
    heightAmp: number;
    speed: number;
  };
}

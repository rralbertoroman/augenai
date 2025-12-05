// ─────────────────────────────────────────────────────────────────────────────
// Entity Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Disease {
  id: string;
  name: string;
  stages: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SharedDataContextType {
  // Diseases
  diseases: Disease[];
  diseasesLoading: boolean;
  diseasesError: string | null;
  refreshDiseases: () => Promise<void>;

  // Diseases map for quick lookup
  diseasesMap: Map<string, Disease>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Viewer Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color?: string;
}

export interface ImageBoundingBoxesProps {
  bucketName: string;
  path: string;
  boxes: BoundingBox[];
  showLabels?: boolean;
  interactive?: boolean;
  onBoxClick?: (box: BoundingBox) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clipboard Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ClipboardDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

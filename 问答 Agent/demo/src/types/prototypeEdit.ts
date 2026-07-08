export interface PrototypeEditPending {
  editId: string;
  pageId: string;
  summary: string;
  previewUrl: string;
  instruction: string;
  createdAt?: string;
}

export interface PrototypeEditPlanResult {
  editId: string;
  pageId: string;
  summary: string;
  previewUrl: string;
  instruction: string;
}

export interface PrototypeEditConfirmResult {
  pageId: string;
  moduleName: string;
  breadcrumb?: string;
  previewUrl: string;
  summary?: string;
}

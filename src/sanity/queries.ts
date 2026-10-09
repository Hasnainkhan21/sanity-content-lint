
export const DOCUMENTS_QUERY = `*[
  !(_id in path("drafts.**"))
]{
  ...
}`;
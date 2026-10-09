
export const DOCUMENTS_QUERY = `*[
  !(_id in path("drafts.**"))
]{
  _id,
  _type,
  title,
  slug
}`;
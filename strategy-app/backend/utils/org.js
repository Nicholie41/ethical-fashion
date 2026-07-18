function slugifyOrgName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function createUniqueOrgSlug(Organization, name) {
  const base = slugifyOrgName(name) || "org";
  let slug = base;
  let suffix = 1;

  while (await Organization.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

module.exports = { slugifyOrgName, createUniqueOrgSlug };

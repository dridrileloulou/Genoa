export function buildFamilyGraph(membres, unions) {
  const map = new Map();

  membres.forEach((m) => {
    map.set(m.id, {
      ...m,
      parents: [],
      children: [],
    });
  });

  unions.forEach((u) => {
    const p1 = map.get(u.id_membre_1);
    const p2 = map.get(u.id_membre_2);

    const children = membres.filter((m) => m.id_union === u.id);

    children.forEach((child) => {
      const c = map.get(child.id);
      if (!c) return;

      if (p1) {
        c.parents.push(p1.id);
        p1.children.push(c.id);
      }

      if (p2) {
        c.parents.push(p2.id);
        p2.children.push(c.id);
      }
    });
  });

  return Array.from(map.values());
}

export function toDag(nodes) {
  return nodes.map((n) => ({
    id: String(n.id),
    parentIds: n.parents.map(String),
    data: n,
  }));
}

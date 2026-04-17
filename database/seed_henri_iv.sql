-- =====================================================
-- SEED : Descendance d'Henri IV (4 générations, ~23 membres)
-- Données historiques réelles
-- =====================================================

BEGIN;

-- =====================================================
-- GÉNÉRATION 0 : Henri IV et ses conjointes
-- Ces membres n'ont pas de parents dans notre arbre (id_union = NULL)
-- =====================================================

-- Henri IV, roi de France et de Navarre
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('M', 'Henri', 'de Bourbon', '1553-12-13', '1610-05-14', NULL, 'Roi de France et de Navarre (1589-1610). Surnommé "le Bon Roi Henri" et "le Vert-Galant". Premier roi de la maison de Bourbon. Promulgua l''Édit de Nantes (1598) pour la tolérance religieuse. Assassiné par Ravaillac.', NULL, false, NULL, NULL);

-- Marguerite de Valois, première épouse d'Henri IV
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Marguerite', 'de Valois', '1553-05-14', '1615-03-27', NULL, 'Reine de France (1572-1599), surnommée "la Reine Margot". Fille d''Henri II et Catherine de Médicis. Mariage annulé en 1599 pour cause de stérilité. Femme de lettres et mécène.', NULL, false, NULL, NULL);

-- Marie de Médicis, seconde épouse d'Henri IV
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Marie', 'de Médicis', '1575-04-26', '1642-07-03', NULL, 'Reine de France (1600-1610), régente (1610-1614). Fille de François Ier de Médicis, grand-duc de Toscane. Commanditaire du cycle de peintures de Rubens au palais du Luxembourg.', NULL, false, NULL, NULL);

-- Anne d'Autriche, épouse de Louis XIII (pas de parents dans notre arbre)
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Anne', 'd''Autriche', '1601-09-22', '1666-01-20', NULL, 'Reine de France (1615-1643), régente (1643-1651). Infante d''Espagne, fille de Philippe III. Mère de Louis XIV. Gouverna avec le cardinal Mazarin pendant la minorité de son fils.', NULL, false, NULL, NULL);

-- Marie-Thérèse d'Autriche, épouse de Louis XIV
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Marie-Thérèse', 'd''Autriche', '1638-09-10', '1683-07-30', NULL, 'Reine de France (1660-1683). Infante d''Espagne, fille de Philippe IV. Mariage scellant le traité des Pyrénées (1659) entre la France et l''Espagne. Cousine germaine de Louis XIV.', NULL, false, NULL, NULL);

-- Marie Anne de Bavière, épouse du Grand Dauphin
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Marie Anne', 'de Bavière', '1660-11-28', '1690-04-20', NULL, 'Dauphine de France. Fille de Ferdinand-Marie de Bavière. Épouse de Louis de France, le Grand Dauphin. Décédée à 29 ans, réputée pieuse et effacée à la cour de Versailles.', NULL, false, NULL, NULL);

-- Henriette d'Angleterre, première épouse de Philippe d'Orléans
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Henriette', 'd''Angleterre', '1644-06-16', '1670-06-30', NULL, 'Duchesse d''Orléans, surnommée "Minette". Fille de Charles Ier d''Angleterre. Joua un rôle diplomatique clé dans le traité de Douvres (1670). Morte subitement à 26 ans, possiblement empoisonnée.', NULL, false, NULL, NULL);

-- Élisabeth Charlotte du Palatinat, seconde épouse de Philippe d'Orléans
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
VALUES ('F', 'Élisabeth Charlotte', 'du Palatinat', '1652-05-27', '1722-12-08', NULL, 'Duchesse d''Orléans, surnommée "la Princesse Palatine" ou "Liselotte". Célèbre pour ses milliers de lettres décrivant la vie à la cour de Versailles avec un franc-parler remarquable.', NULL, false, NULL, NULL);

-- =====================================================
-- UNION 1 : Henri IV + Marguerite de Valois (mariage 1572, annulé 1599)
-- Pas d'enfants de cette union
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT h.id, m.id, '1572-08-18', '1599-12-17'
FROM membres h, membres m
WHERE h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
  AND m."prénom" = 'Marguerite' AND m.nom = 'de Valois';

-- =====================================================
-- UNION 2 : Henri IV + Marie de Médicis (mariage 1600)
-- 6 enfants
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT h.id, m.id, '1600-12-17', NULL
FROM membres h, membres m
WHERE h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
  AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- =====================================================
-- GÉNÉRATION 1 : Enfants d'Henri IV et Marie de Médicis
-- Leur id_union pointe vers l'union Henri IV + Marie de Médicis
-- =====================================================

-- Louis XIII
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Louis XIII', 'de France', '1601-09-27', '1643-05-14', NULL,
'Roi de France (1610-1643), surnommé "le Juste". Accéda au trône à 8 ans. Gouverna avec le cardinal de Richelieu. Renforça le pouvoir royal et combattit les protestants lors du siège de La Rochelle (1627-1628).',
NULL, false, u.id, true
FROM unions u
JOIN membres h ON u.id_membre_1 = h.id AND h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- Élisabeth de France
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'F', 'Élisabeth', 'de France', '1602-11-22', '1644-10-06', NULL,
'Reine consort d''Espagne par son mariage avec Philippe IV d''Espagne en 1615. Surnommée "Isabelle de Bourbon" en Espagne. Mère de Balthasar Charles et de Marie-Thérèse (future reine de France).',
NULL, false, u.id, true
FROM unions u
JOIN membres h ON u.id_membre_1 = h.id AND h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- Christine de France
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'F', 'Christine', 'de France', '1606-02-10', '1663-12-27', NULL,
'Duchesse de Savoie par son mariage avec Victor-Amédée Ier en 1619. Régente du duché de Savoie (1637-1648). Surnommée "Madame Royale". Femme politique influente dans le Piémont.',
NULL, false, u.id, true
FROM unions u
JOIN membres h ON u.id_membre_1 = h.id AND h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- Nicolas Henri de France
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Nicolas Henri', 'de France', '1607-04-16', '1611-11-17', NULL,
'Duc d''Orléans. Troisième fils d''Henri IV. Décédé à l''âge de 4 ans. Sa mort précoce permit à son frère cadet Gaston de devenir duc d''Orléans et héritier présomptif.',
NULL, false, u.id, true
FROM unions u
JOIN membres h ON u.id_membre_1 = h.id AND h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- Gaston d'Orléans
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Gaston', 'd''Orléans', '1608-04-24', '1660-02-02', NULL,
'Duc d''Orléans, frère de Louis XIII. Surnommé "Monsieur". Conspirateur perpétuel contre Richelieu et Mazarin. Lieutenant général du royaume. Passionné de botanique, créa les jardins de Blois.',
NULL, false, u.id, true
FROM unions u
JOIN membres h ON u.id_membre_1 = h.id AND h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- Henriette Marie de France
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'F', 'Henriette Marie', 'de France', '1609-11-25', '1669-09-10', NULL,
'Reine consort d''Angleterre, d''Écosse et d''Irlande par son mariage avec Charles Ier en 1625. Mère de Charles II et Jacques II. Catholique fervente, son influence religieuse contribua aux tensions de la guerre civile anglaise.',
NULL, false, u.id, true
FROM unions u
JOIN membres h ON u.id_membre_1 = h.id AND h."prénom" = 'Henri' AND h.nom = 'de Bourbon'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie' AND m.nom = 'de Médicis';

-- =====================================================
-- UNION 3 : Louis XIII + Anne d'Autriche (mariage 1615)
-- 2 enfants
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT l.id, a.id, '1615-11-25', NULL
FROM membres l, membres a
WHERE l."prénom" = 'Louis XIII' AND l.nom = 'de France'
  AND a."prénom" = 'Anne' AND a.nom = 'd''Autriche';

-- =====================================================
-- GÉNÉRATION 2 : Enfants de Louis XIII et Anne d'Autriche
-- =====================================================

-- Louis XIV
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Louis XIV', 'de France', '1638-09-05', '1715-09-01', NULL,
'Roi de France (1643-1715), le "Roi-Soleil". Plus long règne de l''histoire de France (72 ans). Bâtisseur du château de Versailles. Révoqua l''Édit de Nantes (1685). Mécène des arts : Molière, Racine, Lully, Le Brun.',
NULL, false, u.id, true
FROM unions u
JOIN membres l ON u.id_membre_1 = l.id AND l."prénom" = 'Louis XIII' AND l.nom = 'de France'
JOIN membres a ON u.id_membre_2 = a.id AND a."prénom" = 'Anne' AND a.nom = 'd''Autriche';

-- Philippe d'Orléans (frère de Louis XIV)
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Philippe', 'd''Orléans', '1640-09-21', '1701-06-09', NULL,
'Duc d''Orléans, frère cadet de Louis XIV, surnommé "Monsieur". Brillant chef militaire, vainqueur à la bataille de Cassel (1677). Fondateur de la branche d''Orléans. Résida au Palais-Royal et au château de Saint-Cloud.',
NULL, false, u.id, true
FROM unions u
JOIN membres l ON u.id_membre_1 = l.id AND l."prénom" = 'Louis XIII' AND l.nom = 'de France'
JOIN membres a ON u.id_membre_2 = a.id AND a."prénom" = 'Anne' AND a.nom = 'd''Autriche';

-- =====================================================
-- UNION 4 : Louis XIV + Marie-Thérèse d'Autriche (mariage 1660)
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT l.id, mt.id, '1660-06-09', NULL
FROM membres l, membres mt
WHERE l."prénom" = 'Louis XIV' AND l.nom = 'de France'
  AND mt."prénom" = 'Marie-Thérèse' AND mt.nom = 'd''Autriche';

-- =====================================================
-- UNION 5 : Philippe d'Orléans + Henriette d'Angleterre (mariage 1661)
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT p.id, h.id, '1661-03-31', '1670-06-30'
FROM membres p, membres h
WHERE p."prénom" = 'Philippe' AND p.nom = 'd''Orléans' AND p.date_naissance = '1640-09-21'
  AND h."prénom" = 'Henriette' AND h.nom = 'd''Angleterre';

-- =====================================================
-- UNION 6 : Philippe d'Orléans + Élisabeth Charlotte du Palatinat (mariage 1671)
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT p.id, e.id, '1671-11-16', NULL
FROM membres p, membres e
WHERE p."prénom" = 'Philippe' AND p.nom = 'd''Orléans' AND p.date_naissance = '1640-09-21'
  AND e."prénom" = 'Élisabeth Charlotte' AND e.nom = 'du Palatinat';

-- =====================================================
-- GÉNÉRATION 3 : Enfants de Louis XIV + Marie-Thérèse
-- =====================================================

-- Louis de France, le Grand Dauphin
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Louis', 'de France', '1661-11-01', '1711-04-14', NULL,
'Le "Grand Dauphin", fils aîné de Louis XIV. Héritier du trône pendant 49 ans mais ne régna jamais, décédé de la variole avant son père. Collectionneur d''art passionné, résida au château de Meudon.',
NULL, false, u.id, true
FROM unions u
JOIN membres l ON u.id_membre_1 = l.id AND l."prénom" = 'Louis XIV' AND l.nom = 'de France'
JOIN membres mt ON u.id_membre_2 = mt.id AND mt."prénom" = 'Marie-Thérèse' AND mt.nom = 'd''Autriche';

-- =====================================================
-- Enfants de Philippe d'Orléans + Henriette d'Angleterre (union 5)
-- =====================================================

-- Marie Louise d'Orléans
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'F', 'Marie Louise', 'd''Orléans', '1662-03-27', '1689-02-12', NULL,
'Reine consort d''Espagne par son mariage avec Charles II en 1679. Très aimée du peuple espagnol. Morte à 26 ans, possiblement empoisonnée. Son décès sans héritier contribua à la crise de succession d''Espagne.',
NULL, false, u.id, true
FROM unions u
JOIN membres p ON u.id_membre_1 = p.id AND p."prénom" = 'Philippe' AND p.nom = 'd''Orléans' AND p.date_naissance = '1640-09-21'
JOIN membres h ON u.id_membre_2 = h.id AND h."prénom" = 'Henriette' AND h.nom = 'd''Angleterre';

-- Anne Marie d'Orléans
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'F', 'Anne Marie', 'd''Orléans', '1669-08-27', '1728-08-26', NULL,
'Reine consort de Sardaigne par son mariage avec Victor-Amédée II de Savoie en 1684. Mère de Marie Adélaïde de Savoie (future dauphine de France). Ancêtre de nombreuses maisons royales européennes.',
NULL, false, u.id, true
FROM unions u
JOIN membres p ON u.id_membre_1 = p.id AND p."prénom" = 'Philippe' AND p.nom = 'd''Orléans' AND p.date_naissance = '1640-09-21'
JOIN membres h ON u.id_membre_2 = h.id AND h."prénom" = 'Henriette' AND h.nom = 'd''Angleterre';

-- =====================================================
-- Enfants de Philippe d'Orléans + Élisabeth Charlotte (union 6)
-- =====================================================

-- Philippe II d'Orléans (le Régent)
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Philippe II', 'd''Orléans', '1674-08-02', '1723-12-02', NULL,
'Duc d''Orléans, Régent de France (1715-1723) pendant la minorité de Louis XV. Homme cultivé, peintre, musicien et chimiste amateur. Sa régence marqua une période de libéralisation après le règne austère de Louis XIV.',
NULL, false, u.id, true
FROM unions u
JOIN membres p ON u.id_membre_1 = p.id AND p."prénom" = 'Philippe' AND p.nom = 'd''Orléans' AND p.date_naissance = '1640-09-21'
JOIN membres e ON u.id_membre_2 = e.id AND e."prénom" = 'Élisabeth Charlotte' AND e.nom = 'du Palatinat';

-- Élisabeth Charlotte d'Orléans
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'F', 'Élisabeth Charlotte', 'd''Orléans', '1676-09-13', '1744-12-23', NULL,
'Duchesse de Lorraine par son mariage avec Léopold Ier de Lorraine en 1698. Mère de François Ier, empereur du Saint-Empire, qui épousa Marie-Thérèse d''Autriche. Ancêtre des Habsbourg-Lorraine.',
NULL, false, u.id, true
FROM unions u
JOIN membres p ON u.id_membre_1 = p.id AND p."prénom" = 'Philippe' AND p.nom = 'd''Orléans' AND p.date_naissance = '1640-09-21'
JOIN membres e ON u.id_membre_2 = e.id AND e."prénom" = 'Élisabeth Charlotte' AND e.nom = 'du Palatinat';

-- =====================================================
-- UNION 7 : Louis (Grand Dauphin) + Marie Anne de Bavière (mariage 1680)
-- =====================================================
INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation")
SELECT l.id, m.id, '1680-03-07', NULL
FROM membres l, membres m
WHERE l."prénom" = 'Louis' AND l.nom = 'de France' AND l.date_naissance = '1661-11-01'
  AND m."prénom" = 'Marie Anne' AND m.nom = 'de Bavière';

-- =====================================================
-- GÉNÉRATION 4 : Enfants du Grand Dauphin + Marie Anne de Bavière
-- =====================================================

-- Louis, duc de Bourgogne
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Louis', 'duc de Bourgogne', '1682-08-16', '1712-02-18', NULL,
'Petit-fils de Louis XIV, dauphin de France (1711-1712). Élève de Fénelon qui en fit un prince éclairé et pieux. Mort de la rougeole à 29 ans, quelques jours après son épouse Marie Adélaïde de Savoie. Père de Louis XV.',
NULL, false, u.id, true
FROM unions u
JOIN membres l ON u.id_membre_1 = l.id AND l."prénom" = 'Louis' AND l.nom = 'de France' AND l.date_naissance = '1661-11-01'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie Anne' AND m.nom = 'de Bavière';

-- Philippe V d'Espagne
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Philippe V', 'd''Espagne', '1683-12-19', '1746-07-09', NULL,
'Roi d''Espagne (1700-1746), premier Bourbon espagnol. Petit-fils de Louis XIV. Son accession au trône déclencha la guerre de Succession d''Espagne (1701-1714). Abdiqua brièvement en 1724 avant de reprendre le pouvoir. Souffrait de mélancolie sévère.',
NULL, false, u.id, true
FROM unions u
JOIN membres l ON u.id_membre_1 = l.id AND l."prénom" = 'Louis' AND l.nom = 'de France' AND l.date_naissance = '1661-11-01'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie Anne' AND m.nom = 'de Bavière';

-- Charles, duc de Berry
INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique)
SELECT 'M', 'Charles', 'duc de Berry', '1686-08-31', '1714-05-05', NULL,
'Duc de Berry, troisième petit-fils de Louis XIV. Réputé bon vivant et chasseur passionné. Mort à 27 ans des suites d''un accident de cheval lors d''une partie de chasse. Marié à Marie Louise Élisabeth d''Orléans.',
NULL, false, u.id, true
FROM unions u
JOIN membres l ON u.id_membre_1 = l.id AND l."prénom" = 'Louis' AND l.nom = 'de France' AND l.date_naissance = '1661-11-01'
JOIN membres m ON u.id_membre_2 = m.id AND m."prénom" = 'Marie Anne' AND m.nom = 'de Bavière';

COMMIT;

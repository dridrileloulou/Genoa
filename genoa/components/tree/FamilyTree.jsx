import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Line, G, Rect, Text as SvgText, Circle } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { getMembres, getUnions } from '@/components/api/api';
import MemberModal from './MemberModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const NODE_W = 130;
const NODE_H = 52;
const H_GAP = 60;
const V_GAP = 100;

function buildFamilyLayout(membres, unions) {
  if (!membres.length) return { nodes: [], links: [], unionNodes: [] };

  const unionEnfants = {};
  unions.forEach((u) => {
    unionEnfants[u.id] = membres.filter((m) => m.id_union === u.id);
  });

  const hasParents = (m) => m.id_union && unions.find((u) => u.id === m.id_union);
  const roots = membres.filter((m) => !hasParents(m));

  const positionMap = {};
  const nodes = [];
  const links = [];
  const unionNodes = [];

  const generations = {};
  const queue = [...roots.map((r) => ({ m: r, gen: 0 }))];
  const visited = new Set();

  while (queue.length) {
    const { m, gen } = queue.shift();
    if (visited.has(m.id)) continue;
    visited.add(m.id);
    generations[m.id] = gen;

    const memberUnions = unions.filter(
      (u) => u.id_membre_1 === m.id || u.id_membre_2 === m.id
    );
    memberUnions.forEach((u) => {
      (unionEnfants[u.id] || []).forEach((enfant) => {
        if (!visited.has(enfant.id)) {
          queue.push({ m: enfant, gen: gen + 1 });
        }
      });
    });
  }

  membres.forEach((m) => {
    if (!visited.has(m.id)) {
      generations[m.id] = 0;
    }
  });

  const genGroups = {};
  membres.forEach((m) => {
    const g = generations[m.id] ?? 0;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(m);
  });

  const maxGen = Math.max(...Object.keys(genGroups).map(Number));
  for (let g = 0; g <= maxGen; g++) {
    const group = genGroups[g] || [];
    group.forEach((m, i) => {
      const x = i * (NODE_W + H_GAP);
      const y = g * (NODE_H + V_GAP);
      positionMap[m.id] = { x, y };
      nodes.push({ id: m.id, x, y, data: m });
    });
  }

  unions.forEach((u) => {
    const enfants = unionEnfants[u.id] || [];
    if (enfants.length === 0) return;

    const p1 = u.id_membre_1 ? positionMap[u.id_membre_1] : null;
    const p2 = u.id_membre_2 ? positionMap[u.id_membre_2] : null;

    let ux, uy;
    if (p1 && p2) {
      ux = (p1.x + p2.x) / 2 + NODE_W / 2;
      uy = (p1.y + p2.y) / 2 + NODE_H;
    } else if (p1) {
      ux = p1.x + NODE_W / 2;
      uy = p1.y + NODE_H;
    } else if (p2) {
      ux = p2.x + NODE_W / 2;
      uy = p2.y + NODE_H;
    } else {
      return;
    }

    unionNodes.push({ id: u.id, x: ux, y: uy });

    if (p1) {
      links.push({ x1: p1.x + NODE_W / 2, y1: p1.y + NODE_H, x2: ux, y2: uy, type: 'parent' });
    }
    if (p2) {
      links.push({ x1: p2.x + NODE_W / 2, y1: p2.y + NODE_H, x2: ux, y2: uy, type: 'parent' });
    }

    enfants.forEach((enfant) => {
      const ep = positionMap[enfant.id];
      if (ep) {
        links.push({ x1: ux, y1: uy, x2: ep.x + NODE_W / 2, y2: ep.y, type: 'child' });
      }
    });
  });

  return { nodes, links, unionNodes };
}

// Composant nœud draggable individuel
function DraggableNode({ node, onPress, onPositionChange }) {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffX = useSharedValue(0);
  const savedOffY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const dragGesture = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      offsetX.value = savedOffX.value + e.translationX;
      offsetY.value = savedOffY.value + e.translationY;
      runOnJS(onPositionChange)(node.id, savedOffX.value + e.translationX, savedOffY.value + e.translationY);
    })
    .onEnd(() => {
      savedOffX.value = offsetX.value;
      savedOffY.value = offsetY.value;
      isDragging.value = false;
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onPress)(node);
    });

  const gesture = Gesture.Exclusive(dragGesture, tapGesture);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: node.x + offsetX.value,
    top: node.y + offsetY.value,
    width: NODE_W,
    height: NODE_H,
    zIndex: isDragging.value ? 999 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animStyle}>
        <Svg width={NODE_W} height={NODE_H}>
          <Rect
            x={0}
            y={0}
            width={NODE_W}
            height={NODE_H}
            rx={10}
            ry={10}
            fill="#122b1c"
            stroke="rgba(76,218,122,0.25)"
            strokeWidth={1}
          />
          <SvgText
            x={NODE_W / 2}
            y={NODE_H / 2 - 6}
            fontSize="13"
            fontWeight="700"
            fill="#dff0e4"
            textAnchor="middle"
          >
            {node.data['prénom']}
          </SvgText>
          <SvgText
            x={NODE_W / 2}
            y={NODE_H / 2 + 10}
            fontSize="11"
            fill="rgba(180,220,190,0.55)"
            textAnchor="middle"
          >
            {node.data.nom || ''}
          </SvgText>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

export default function FamilyTree({ userId, userRole, targetUserId }) {
  const [membres, setMembres] = useState([]);
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  // Positions custom des nœuds (drag)
  const [nodeOffsets, setNodeOffsets] = useState({});

  // Zoom / Pan global
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const canEdit = userRole === 'admin' || userRole === 'editeur';
  const isAdminRole = userRole === 'admin';

  // L'id_user du propriétaire de l'arbre affiché
  const treeOwnerId = targetUserId || userId;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, u] = await Promise.all([getMembres(), getUnions()]);
      
      // Filtrer les membres par treeOwnerId
      const allMembres = Array.isArray(m) ? m : [];
      const filteredMembres = treeOwnerId 
        ? allMembres.filter((membre) => membre.id_user === treeOwnerId)
        : allMembres;
      
      // Créer un Set des IDs de membres de cet arbre
      const membreIdsSet = new Set(filteredMembres.map(membre => membre.id));
      
      // Filtrer les unions : une union appartient à l'arbre si au moins un de ses membres y appartient
      const allUnions = Array.isArray(u) ? u : [];
      const filteredUnions = allUnions.filter((union) => 
        membreIdsSet.has(union.id_membre_1) || membreIdsSet.has(union.id_membre_2)
      );
      
      setMembres(filteredMembres);
      setUnions(filteredUnions);
      setNodeOffsets({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [treeOwnerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { nodes, links, unionNodes } = buildFamilyLayout(membres, unions);

  // Positions effectives (base + offset drag)
  const getEffectivePos = (nodeId, baseX, baseY) => {
    const off = nodeOffsets[nodeId] || { dx: 0, dy: 0 };
    return { x: baseX + off.dx, y: baseY + off.dy };
  };

  const maxX = nodes.reduce((acc, n) => Math.max(acc, n.x + NODE_W + 200), SCREEN_W);
  const maxY = nodes.reduce((acc, n) => Math.max(acc, n.y + NODE_H + 200), SCREEN_H);
  const svgW = maxX + H_GAP;
  const svgH = maxY + V_GAP;

  const pinch = Gesture.Pinch()
    .onUpdate((e) => { scale.value = Math.max(0.3, Math.min(savedScale.value * e.scale, 4)); })
    .onEnd(() => { savedScale.value = scale.value; });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const globalGesture = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleNodePress = (node) => {
    setSelectedMembre(node.data);
    setShowMemberModal(true);
  };

  const handlePositionChange = useCallback((nodeId, dx, dy) => {
    setNodeOffsets((prev) => ({ ...prev, [nodeId]: { dx, dy } }));
  }, []);

  // Recalcule les liens en tenant compte des offsets
  const computedLinks = [];
  unions.forEach((u) => {
    const enfants = membres.filter((m) => m.id_union === u.id);
    if (enfants.length === 0) return;

    const p1Node = nodes.find((n) => n.id === u.id_membre_1);
    const p2Node = nodes.find((n) => n.id === u.id_membre_2);

    const p1 = p1Node ? getEffectivePos(p1Node.id, p1Node.x, p1Node.y) : null;
    const p2 = p2Node ? getEffectivePos(p2Node.id, p2Node.x, p2Node.y) : null;

    let ux, uy;
    if (p1 && p2) {
      ux = (p1.x + p2.x) / 2 + NODE_W / 2;
      uy = (p1.y + p2.y) / 2 + NODE_H;
    } else if (p1) {
      ux = p1.x + NODE_W / 2;
      uy = p1.y + NODE_H;
    } else if (p2) {
      ux = p2.x + NODE_W / 2;
      uy = p2.y + NODE_H;
    } else {
      return;
    }

    if (p1) {
      computedLinks.push({ x1: p1.x + NODE_W / 2, y1: p1.y + NODE_H, x2: ux, y2: uy, type: 'parent' });
    }
    if (p2) {
      computedLinks.push({ x1: p2.x + NODE_W / 2, y1: p2.y + NODE_H, x2: ux, y2: uy, type: 'parent' });
    }

    enfants.forEach((enfant) => {
      const eNode = nodes.find((n) => n.id === enfant.id);
      if (eNode) {
        const ep = getEffectivePos(eNode.id, eNode.x, eNode.y);
        computedLinks.push({ x1: ux, y1: uy, x2: ep.x + NODE_W / 2, y2: ep.y, type: 'child' });
      }
    });
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4cda7a" size="large" />
        <Text style={styles.loadingText}>Chargement de l'arbre...</Text>
      </View>
    );
  }

  if (nodes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Aucun membre dans cet arbre.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={globalGesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          {/* SVG pour les liens uniquement */}
          <Svg
            style={{ position: 'absolute', top: 0, left: 0 }}
            width={svgW}
            height={svgH}
            pointerEvents="none"
          >
            {computedLinks.map((link, i) => (
              <Line
                key={`link-${i}`}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke={link.type === 'parent' ? 'rgba(76,218,122,0.3)' : 'rgba(76,218,122,0.5)'}
                strokeWidth={link.type === 'parent' ? 1.5 : 2}
                strokeDasharray={link.type === 'parent' ? '4,4' : undefined}
              />
            ))}
            {/* Nœuds union */}
            {unionNodes.map((u) => {
              const p1Node = nodes.find((n) => n.id === unions.find(un => un.id === u.id)?.id_membre_1);
              const p2Node = nodes.find((n) => n.id === unions.find(un => un.id === u.id)?.id_membre_2);
              const p1 = p1Node ? getEffectivePos(p1Node.id, p1Node.x, p1Node.y) : null;
              const p2 = p2Node ? getEffectivePos(p2Node.id, p2Node.x, p2Node.y) : null;
              let ux = u.x, uy = u.y;
              if (p1 && p2) { ux = (p1.x + p2.x) / 2 + NODE_W / 2; uy = (p1.y + p2.y) / 2 + NODE_H; }
              else if (p1) { ux = p1.x + NODE_W / 2; uy = p1.y + NODE_H; }
              else if (p2) { ux = p2.x + NODE_W / 2; uy = p2.y + NODE_H; }
              return <Circle key={`union-${u.id}`} cx={ux} cy={uy} r={5} fill="rgba(76,218,122,0.4)" />;
            })}
          </Svg>

          {/* Nœuds draggables */}
          <View style={{ width: svgW, height: svgH }}>
            {nodes.map((node) => (
              <DraggableNode
                key={`node-${node.id}`}
                node={node}
                onPress={handleNodePress}
                onPositionChange={handlePositionChange}
              />
            ))}
          </View>
        </Animated.View>
      </GestureDetector>

      <MemberModal
        visible={showMemberModal}
        membre={selectedMembre}
        onClose={() => setShowMemberModal(false)}
        onSuccess={loadData}
        canEdit={canEdit}
        isAdmin={isAdminRole}
        currentUserId={treeOwnerId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f12' },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0a1f12', gap: 12,
  },
  loadingText: { color: 'rgba(180,220,190,0.5)', fontSize: 14 },
  emptyText: { color: 'rgba(180,220,190,0.5)', fontSize: 16 },
}); 
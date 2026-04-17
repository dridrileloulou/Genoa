import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";

import {
  graphStratify,
  sugiyama,
  decrossOpt,
  coordCenter,
} from "d3-dag";

import { buildFamilyGraph, toDag } from "../../utils/buildFamilyGraph";
import { API_URL } from '@/constants/api';

const API = API_URL;

export default function BasicTree({ token }) {
  const [members, setMembers] = useState([]);
  const [unions, setUnions] = useState([]);
  const [user, setUser] = useState(null);
  const safeMembers = Array.isArray(members) ? members : [];
  const safeUnions = Array.isArray(unions) ? unions : [];


  const isConnected = !!token;

  // 🔐 decode user (role + id)
  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch (e) {
      setUser(null);
    }
  }, [token]);

  // 📦 FETCH (public access autorisé)
  const load = async () => {
    const headers = token
      ? { Authorization: token }
      : undefined;

    const [mRes, uRes] = await Promise.all([
      fetch(`${API}/membres`, { headers }),
      fetch(`${API}/unions`, { headers }),
    ]);

    const mData = await mRes.json();
    const uData = await uRes.json();

    console.log("membres:", mData);
    console.log("unions:", uData);

    // 🛡️ SAFE GUARD (IMPORTANT)
    setMembers(Array.isArray(mData) ? mData : []);
    setUnions(Array.isArray(uData) ? uData : []);
  };


  useEffect(() => {
    load();
  }, [token]);

  // 🧠 ROLE LOGIC
  const canEdit = useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || user.role === "éditeur";
  }, [user]);

  const graph = useMemo(() => {
    if (!safeMembers.length) return [];
    return buildFamilyGraph(safeMembers, safeUnions);
  }, [safeMembers, safeUnions]);


  const { nodes, links } = useMemo(() => {
    if (!graph.length) return { nodes: [], links: [] };

    const dag = graphStratify()(toDag(graph));

    const layout = sugiyama()
      .nodeSize(() => [120, 120])
      .decross(decrossOpt())
      .coord(coordCenter());

    layout(dag);

    return {
      nodes: Array.from(dag.nodes()),
      links: Array.from(dag.links()),
    };
  }, [graph]);


  return (
    <View style={{ flex: 1 }}>

      {/* 🧭 UI MODE */}
      <View style={{ padding: 10 }}>
        <Text>
          Mode : {isConnected ? "Connecté" : "Invité"}
        </Text>
        {user && <Text>Role : {user.role}</Text>}
      </View>

      {/* 🌳 GRAPH */}
      <Svg width={2000} height={2000}>
        {links.map((l, i) => (
          <Line
            key={i}
            x1={l.source.x}
            y1={l.source.y}
            x2={l.target.x}
            y2={l.target.y}
            stroke="#999"
          />
        ))}

        {nodes.map((n, i) => (
          <G key={i}>
            <Circle cx={n.x} cy={n.y} r={25} fill="#4A90E2" />

            <SvgText
              x={n.x}
              y={n.y + 5}
              fontSize={12}
              fill="#fff"
              textAnchor="middle"
            >
              {n.data.prénom}
            </SvgText>

            {/* ✏️ bouton edit seulement si autorisé */}
            {canEdit && user?.id === n.data.id_user && (
              <Circle
                cx={n.x + 18}
                cy={n.y - 18}
                r={6}
                fill="orange"
              />
            )}
          </G>
        ))}
      </Svg>
      

    </View>
  );
  console.log("members:", members);
  console.log("unions:", unions);

}

import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Text, G } from "react-native-svg";

import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  graphStratify,
  sugiyama,
  decrossOpt,
  coordCenter,
} from "d3-dag";

export default function BasicTree() {
  // 📊 Données
  const data = [
    { id: "A" },
    { id: "B", parentIds: ["A"] },
    { id: "C", parentIds: ["A"] },
    { id: "D", parentIds: ["B"] },
    { id: "E", parentIds: ["B"] },
    { id: "F", parentIds: ["C"] },
  ];

  // 🌳 Layout DAG
  const { nodes, links } = useMemo(() => {
    const dag = graphStratify()(data);

    const layout = sugiyama()
      .nodeSize(() => [120, 120])
      .decross(decrossOpt())
      .coord(coordCenter());

    layout(dag);

    return {
      nodes: Array.from(dag.nodes()),
      links: Array.from(dag.links()),
    };
  }, []);

  // 🔍 Zoom / Pan
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const onWheel = (e) => {
    const delta = e.nativeEvent.deltaY;

    const zoomFactor = delta > 0 ? 0.9 : 1.1;

    const nextScale = scale.value * zoomFactor;

    scale.value = Math.max(0.5, Math.min(nextScale, 3));
    savedScale.value = scale.value;

    
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const gesture = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[{ flex: 1 }, animatedStyle]}
          onWheel={onWheel}
        >
          <Svg width={2000} height={2000}>

            {/* 🔗 LINKS */}
            {links.map((link, i) => (
              <Line
                key={i}
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
                stroke="#999"
                strokeWidth={2}
              />
            ))}

            {/* 🔵 NODES */}
            {nodes.map((node, i) => (
              <G key={i}>
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={25}
                  fill="#4A90E2"
                />
                <Text
                  x={node.x}
                  y={node.y + 5}
                  fontSize="14"
                  fill="#fff"
                  textAnchor="middle"
                >
                  {node.data.id}
                </Text>
              </G>
            ))}

          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

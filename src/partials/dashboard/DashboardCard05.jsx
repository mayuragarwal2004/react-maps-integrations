import React, { useEffect } from "react";
import * as d3 from "d3";

const Card5 = () => {
  const width = 928;
  const height = 680;

  useEffect(() => {
    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Sample data with a main node connected to the parent node of each link
    const data = {
      nodes: [
        { id: "India", group: 0, orders: 120 }, // Main node
        { id: "Maharashtra", group: 1, orders: 45 },
        { id: "Pune", group: 1, orders: 20 },
        { id: "Mumbai", group: 1, orders: 25 },
        { id: "Karnataka", group: 2, orders: 40 },
        { id: "Bangalore", group: 2, orders: 30 },
        { id: "Mysore", group: 2, orders: 10 },
        { id: "Tamil Nadu", group: 3, orders: 35 },
        { id: "Chennai", group: 3, orders: 25 },
        { id: "Kerala", group: 4, orders: 50 },
        { id: "Trivandrum", group: 4, orders: 15 },
        { id: "Kochi", group: 4, orders: 20 },
        { id: "Kozhikode", group: 4, orders: 15 },
      ],
      links: [
        { source: "India", target: "Maharashtra", value: 1 },
        { source: "India", target: "Karnataka", value: 1 },
        { source: "India", target: "Tamil Nadu", value: 1 },
        { source: "India", target: "Kerala", value: 1 },
        { source: "Maharashtra", target: "Pune", value: 1 },
        { source: "Maharashtra", target: "Mumbai", value: 1 },
        { source: "Karnataka", target: "Bangalore", value: 1 },
        { source: "Karnataka", target: "Mysore", value: 1 },
        { source: "Tamil Nadu", target: "Chennai", value: 1 },
        { source: "Kerala", target: "Trivandrum", value: 1 },
        { source: "Kerala", target: "Kochi", value: 1 },
        { source: "Kerala", target: "Kozhikode", value: 1 },
      ],
    };

    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150) // Increase the distance to reduce attraction
      )
      .force("charge", d3.forceManyBody().strength(-1000)) // Repel nodes more strongly
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("center", d3.forceCenter());

    const svg = d3
      .select("#tree-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g");

    node
      .append("circle")
      .attr("r", 50)
      .attr("fill", (d) => color(d.group));

    node
      .append("text")
      .text((d) => d.id)
      .attr("x", 0) // Center the text horizontally
      .attr("y", -10) // Position the text above the circle
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff"); // Set text color to white

    // Adding the orders count below the node
    node
      .append("text")
      .text((d) => `${d.orders} orders`)
      .attr("x", 0)
      .attr("y", 15) // Position this text below the circle
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff"); // Set text color to white

    node.append("title").text((d) => d.id);

    node.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup function to remove the SVG on component unmount
    return () => {
      svg.remove();
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="card" id="card5">
      <h3>Tree Visualization</h3>
      <div
        id="tree-container"
        style={{ width: "1800%", height: "600px", overflow: "hidden" }}
      ></div>
    </div>
  );
};

export default Card5;

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Cloud, Stars } from "@react-three/drei";
import { Sun, CloudRain } from "lucide-react";
import gsap from "gsap";

import { Input } from "./input";
import { Button } from "./button";

function WeatherIcon({ condition }) {
  switch (condition.toLowerCase()) {
    case "sunny":
      return <Sun className="w-12 h-12 text-yellow-400" />;
    case "cloudy":
      return <Cloud className="w-12 h-12 text-gray-400" />;
    case "rainy":
      return <CloudRain className="w-12 h-12 text-blue-400" />;
    default:
      return null;
  }
}

function Weather3DScene({ condition }) {
  const cloudRef = useRef();
  const raindropRefs = useRef([]);
  const sunRef = useRef();
  const textRef = useRef();

  const { scene } = useThree();

  useEffect(() => {
    // Animate based on condition
    if (condition === "sunny") {
      gsap.to(sunRef.current.position, {
        y: 2,
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(cloudRef.current.position, {
        y: 5,
        duration: 1,
        ease: "power2.out",
      });
    } else if (condition === "cloudy") {
      gsap.to(cloudRef.current.position, {
        y: 2,
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(sunRef.current.position, {
        y: 5,
        duration: 1,
        ease: "power2.out",
      });
    } else if (condition === "rainy") {
      gsap.to(cloudRef.current.position, {
        y: 2,
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(sunRef.current.position, {
        y: 5,
        duration: 1,
        ease: "power2.out",
      });
      raindropRefs.current.forEach((ref, index) => {
        gsap.to(ref.position, {
          y: -3,
          duration: 1 + Math.random(),
          repeat: -1,
          delay: index * 0.1,
          ease: "none",
          yoyo: true,
        });
      });
    }

    // Animate text
    gsap.from(textRef.current.position, {
      y: -2,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
  }, [condition]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Cloud ref={cloudRef} position={[0, 5, 0]} scale={[1, 1, 1]} />
      <mesh ref={sunRef} position={[3, 5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      {condition === "rainy" &&
        Array(20)
          .fill()
          .map((_, i) => (
            <mesh
              key={i}
              ref={(el) => (raindropRefs.current[i] = el)}
              position={[
                Math.random() * 4 - 2,
                Math.random() * 4 + 2,
                Math.random() * 4 - 2,
              ]}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#87CEEB" />
            </mesh>
          ))}
      <Text
        ref={textRef}
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {condition.toUpperCase()}
      </Text>
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}

export default function EnhancedWeatherDashboard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockWeather = {
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ["sunny", "cloudy", "rainy"][Math.floor(Math.random() * 3)],
      time: new Date().toLocaleTimeString(),
    };
    setWeather(mockWeather);
    setLoading(false);
  };

  const getBackgroundColor = () => {
    if (!weather) return "bg-gray-100";
    switch (weather.condition) {
      case "sunny":
        return "bg-blue-100";
      case "cloudy":
        return "bg-gray-200";
      case "rainy":
        return "bg-blue-200";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div
      className={`min-h-screen ${getBackgroundColor()} transition-colors duration-500 flex flex-col items-center justify-center p-4`}
    >
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-gray-800"
      >
        Enhanced Weather Dashboard
      </motion.h1>
      <div className="w-full max-w-md mb-8">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={fetchWeather} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </Button>
        </div>
      </div>
      {weather && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{city}</h2>
            <p className="text-gray-500">{weather.time}</p>
          </div>
          <div className="flex items-center justify-center mb-4">
            <WeatherIcon condition={weather.condition} />
            <p className="text-5xl font-bold ml-4">{weather.temperature}°C</p>
          </div>
          <p className="text-center text-xl capitalize">{weather.condition}</p>
        </motion.div>
      )}
      <div className="mt-8 w-full max-w-md h-96">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Weather3DScene condition={weather?.condition || "sunny"} />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
    </div>
  );
}

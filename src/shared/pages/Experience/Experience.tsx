import React, { useEffect } from "react";
import InteractiveSurfaceDisplay, {
  InteractiveSurfaceDisplayProps,
} from "../../components/InteractiveSurfaceDisplay/InteractiveSurfaceDisplay";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useGlobal } from "../../providers/DarkModeProvider/DarkModeProvider";

interface ExperienceProps {
  headRef: React.RefObject<THREE.Group | null>;
  shorten: boolean;
}
interface ExpereinceItem {
  name: string;
  period: string;
  job_title: string;
  description: string;
  tech: string;
}
const exprienceTypes: ExpereinceItem[] = [
  {
    name: "Infront Lab",
    period: "December - 2022 - Present",
    job_title: "Frontend developer",
    description:
      "As one of four core developers in a large, distributed SaaS platform for sports clubs, I worked on enhancing fan engagement through customizable activations, social media management, and data analysis tools.",
    tech: "Angular V12- 16, ThreeJS, Prosemirror",
  },
  {
    name: "Pico Get Personal - Acquired by Infront",
    period: "February - 2022 - December - 2022",
    job_title: "Junior Frontend developer",
    description:
      "Joined the team during the acquisition process to replace a departing developer, quickly adapting to the existing activation and data collection platform. Gained deep familiarity with the codebase while integrating new features and enhancing functionality. Focused on adapting the platform to Infront’s needs and aligning it with the purchasing company's fan club ecosystem, ensuring seamless data collection and engagement. Worked on improving the customizable activations and refining data processing to meet the requirements of Infront’s larger-scale user base.",
    tech: "Angular V12",
  },
];
const Experience = ({ headRef, shorten }: ExperienceProps) => {
  const features: InteractiveSurfaceDisplayProps[] = [
    {
      videoSrc: "projects/video/movie.mp4",
      width: 8.88,
      height: 5,
      position: [0, -1.85, -32],
      rotation: [Math.PI / 2, 0, 0],
      text: "User tagging system",
      subtext: "I worked on a user tagging system for social media content planning within a product that enables publishing across multiple platforms simultaneously. Users can create and schedule posts in one place, tag other users, and seamlessly send the content through API calls. One of the key challenges was transforming an HTML element into a rich text editor capable of handling user tagging through event listeners on the HTML tree, allowing for dynamic interactions and modifications. The system was designed to be fully responsive, optimized for both mobile and desktop platforms.",
    },
    {
      videoSrc: "projects/video/movie.mp4",
      width: 8.88,
      height: 5,
      position: [12, -1.85, -32],
      rotation: [Math.PI / 2, 0, 0],
      text: "Media & Folders system",
      subtext: "I managed and developed an advanced media system that simulates a file system using a recursive tree structure to minimize server requests and enhance performance. The system supports file uploads, viewing, tagging, renaming, folder creation, and seamless file movement between directories, handling numerous asynchronous operations efficiently. It was designed to be fully responsive, optimized for both mobile and desktop platforms.",
    },
    {
      videoSrc: "projects/video/movie.mp4",
      width: 8.88,
      height: 5,
      position: [-12, -1.85, -32],
      rotation: [Math.PI / 2, 0, 0],
      text: "Custom Media & Thumbnail player",
      subtext: "I developed an internal media player that allowed sports clubs to set custom thumbnails for their videos, enabling full branding customization for the content they publish. The player was designed to mimic the behavior of YouTube’s video player—specifically, by displaying a preview frame on hover through a small canvas, before the user actively selects a frame. This approach allowed users to browse through frames visually without needing to scrub through the video manually, streamlining the thumbnail selection process. The implementation involved complex asynchronous logic to ensure smooth performance and responsiveness.",
    },
    {
      videoSrc: "projects/video/movie.mp4",
      width: 8.88,
      height: 5,
      position: [-24, -1.85, -32],
      rotation: [Math.PI / 2, 0, 0],
      text: "3D Shootout game activation",
      subtext: "I led the development of the first 3D game at the company—marking a shift from the 2D activations that sports clubs had previously relied on. The initial requirement was to create a basketball shooting game, fully customizable with club-branded visuals and backgrounds. Beyond visual customization, the game was architected with a flexible structure to support different sports types. This allowed us to easily adapt it for clubs from other sports. While the first release included basketball, handball, and football, additional versions for hockey and rugby were later developed in response to club requests. The result was a highly modular and adaptable 3D activation tool tailored to diverse club needs.",
    },
    // You can also add text-based surfaces:
    // {
    //   text: "Feature Info",
    //   width: 4,
    //   height: 3,
    //   position: [2, 0.1, -1],
    //   rotation: [-Math.PI / 2, 0, 0],
    // },
  ];
  const {state} = useGlobal();
  return (
    <>
      <Text
        position={[0, -1.8, -9]}
        rotation={[Math.PI / 2, Math.PI, 0]}
        fontSize={3}
        color={!state?.darkMode ? '#000' : '#fff'}
        anchorX="center"
        anchorY="middle"
        font="fonts/AmaticSC-Bold.ttf"
      >
        Jobs
      </Text>
      <Text
        position={[0, -1.8, -23]}
        rotation={[Math.PI / 2, Math.PI, 0]}
        fontSize={3}
        color={!state?.darkMode ? '#000' : '#fff'}
        anchorX="center"
        anchorY="middle"
        font="fonts/AmaticSC-Bold.ttf"
      >
        Key Features
      </Text>
      {exprienceTypes?.map((experience: ExpereinceItem, index: number) => (
        <>
          <Text
            position={[4.8 - index * 18, -1.8, -12]}
            rotation={[Math.PI / 2, Math.PI, 0]}
            fontSize={1.2}
            color={!state?.darkMode ? '#000' : '#fff'}
            anchorX="center"
            anchorY="middle"
            font="fonts/AmaticSC-Bold.ttf"
          >
            {experience.name} -{" "}
          </Text>
          <Text
            position={[0 + index * (-16), -1.8, -13]}
            rotation={[Math.PI / 2, Math.PI, 0]}
            fontSize={0.7}
            color={!state?.darkMode ? '#000' : '#fff'}
            anchorX="center"
            anchorY="middle"
            font="fonts/AmaticSC-Bold.ttf"
          >
            {experience.period}
          </Text>
          <Text
            position={[5 - index * 13.8, -1.8, -13]}
            rotation={[Math.PI / 2, Math.PI, 0]}
            fontSize={0.7}
            color={!state?.darkMode ? '#000' : '#fff'}
            anchorX="center"
            anchorY="middle"
            font="fonts/AmaticSC-Bold.ttf"
          >
            {experience.job_title} 
          </Text>
          <Text
            position={[3 - index * 10.2, -1.8, -14]}
            rotation={[Math.PI / 2, Math.PI, 0]}
            fontSize={0.7}
            color={!state?.darkMode ? '#000' : '#fff'}
            anchorX="center"
            anchorY="middle"
            font="fonts/AmaticSC-Bold.ttf"
          >
            {experience.tech} 
          </Text>
          <Text
            position={[2 - index * 13, -1.8, -16 - (index * 1.5) ]}
            rotation={[Math.PI / 2, Math.PI, 0]}
            fontSize={0.5}
            color={!state?.darkMode ? '#000' : '#fff'}
            maxWidth={10}
            anchorX="center"
            anchorY="middle"
            font="fonts/AmaticSC-Bold.ttf"
          >
            {experience.description} 
          </Text>
        </>
      ))}

      {features.map((feature, index) => (
        <InteractiveSurfaceDisplay key={index} {...feature} shorten={shorten} />
      ))}
    </>
  );
};

export default Experience;

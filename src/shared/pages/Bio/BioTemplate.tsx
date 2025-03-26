import React, { useEffect, useState } from "react";
import "./BioTemplate.scss"; // Make sure to add styles for .active-item if desired
interface EducationTitle {
  ins_name: string;
  degree_name: string;
  duration: { start_mon: string; end_mon: string };
  description: string;
}
interface WorkingTitle extends EducationTitle {
  active: boolean;
}
interface BioTemplateProps {
  darkMode: boolean;
}
const BioTemplate = (props: BioTemplateProps) => {
  // Define available tabs.
  const tabs = ["Me", "Education", "Work Experience"];
  // Track active tab

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const educationTitles: EducationTitle[] = [
    {
      ins_name: "Tel Aviv Uiversity",
      degree_name: "B.Sc in Digital Sciences for High Tech - Applied computer science",
      duration: { start_mon: "Oct - 2020", end_mon: "Oct - 2022" },
      description: "sad",
    },
    {
      ins_name: "Tel Aviv Uiversity",
      degree_name: "B.Architecture",
      duration: { start_mon: "Oct - 2013", end_mon: "Oct - 2017" },
      description: "sad",
    },
    {
      ins_name: "University of Haifa",
      degree_name: "UX Designer Certification",
      duration: { start_mon: "Oct - 2020", end_mon: "Feb - 2021" },
      description: "sad",
    },
  ];
  const workingTitles: WorkingTitle[] = [
    {
      ins_name: "Infront Lab",
      degree_name: "Front -end developer(Angular V12- 16) ",
      duration: { start_mon: "December - 2022 ", end_mon: "Present" },
      description:
        "As one of four core developers in a large, distributed SaaS platform for sports clubs, I worked on enhancing fan engagement through customizable activations, social media management, and data analysis tools.",
      active: true,
    },
    {
      ins_name: "Pico Get Personal - Acquired by Infront",
      degree_name: "Front -end developer(Angular V12)",
      duration: { start_mon: "February - 2022", end_mon: "December - 2022" },
      description:
        "Joined the team during the acquisition process to replace a departing developer, quickly adapting to the existing activation and data collection platform. Gained deep familiarity with the codebase while integrating new features and enhancing functionality.",
      active: false,
    },
  ];
  useEffect(() => {
  }, [props.darkMode]);
  const EducationTitleContainer = (eTitle: EducationTitle) => {
    return (
      <div className={`${props.darkMode ? "dark" : "light"}`}>
        <div className={`eTitle text ${props.darkMode ? "dark" : "light"}`} key={eTitle.degree_name}>
          <div className="ins-title">
            <div className="deg_name text_title text_bold text_title_med">{eTitle.degree_name}</div>
            <div className="int_name text_bold">{eTitle.ins_name}</div>
            <div className="duration">{eTitle.duration.start_mon + " - " + eTitle.duration.end_mon}</div>
            <div className="description">{eTitle.description}</div>
          </div>
        </div>
      </div>
    );
  };

  // Content for each tab.
  const renderContent = () => {
    switch (activeTab) {
      case "Me":
        return (
          <>
            <div className={`${props.darkMode ? "dark" : "light"}`}>
              <p>
                I am a multidisciplinary developer and designer with a background in architecture, UX, and computer
                science. With a deep passion for user-focused design and seamless UI/UX, I blend aesthetic precision
                with technical expertise to create engaging digital experiences.
              </p>
              <p>
                My architectural training enhances my structured thinking, allowing me to collaborate effectively with
                product teams and ensure thoughtful, user-centric solutions.
              </p>
              <div className="self-drawing">
              <img src={`${process.env.PUBLIC_URL}/self-drawing.jpg`} alt="Self drawing" />
              </div>
            </div>
          </>
        );
      case "Education":
        return (
          <>
            <p>
              I studied Architecture and Computer Science at XYZ University. During my studies, I developed a passion
              for generative design and interactive media, leading me to blend art with technology in innovative ways.
            </p>
            <p>
              I have also attended various workshops and bootcamps to refine my skills in both front-end development and
              UX design.
            </p>
            {educationTitles.map((educationTitle: EducationTitle) => EducationTitleContainer(educationTitle))}
          </>
        );
      case "Work Experience":
        return (
          <>
            <p>
              Back in the days, my work experience ranged from designing building layouts to developing responsive web
              applications. Today, I am a full time frontend developer.
            </p>
            <p>
              I have collaborated on projects that combine creative design with cutting-edge technology, delivering
              engaging experiences that are both visually appealing and highly functional.
            </p>
            {workingTitles.map((educationTitle: EducationTitle) => EducationTitleContainer(educationTitle))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`dialog-header wave-letter ${props.darkMode ? "dark" : "light"}`}>
        <div className="name-container">
          <div className="text text_title_big text_bold">Ohad Aloni</div>
          <div className="text text_title_med">Architect and Front-end Developer</div>
        </div>
        <div className="items-filter">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`item-box ${activeTab === tab ? "active-item" : ""}`}
              onClick={() => setActiveTab(tab)}
              style={{
                cursor: "pointer",
                // Inline style example for active item (adjust or use CSS instead)
                backgroundColor: activeTab === tab ? "#ffc107" : "transparent",
              }}
            >
              <div className={`text item ${props.darkMode ? "dark" : "light"}`}>
                <span>{tab}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dialog-body wave-letter">
        <div className="content">{renderContent()}</div>
      </div>
    </>
  );
};

export default BioTemplate;

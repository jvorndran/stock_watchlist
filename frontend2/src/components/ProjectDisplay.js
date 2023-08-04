import React from "react";
import '../index.css'
import './style/ProjectDisplayStyle.css'


const imgStyle = {
    height: '80%',
    width: '80%',
}

const gridLeft = {
    display: 'grid',
    gridTemplateColumns: '35% 65%',
    justifyContent: 'space-evenly',
    columnGap: '5vw',
    marginTop: '5vh',
    marginLeft: '5vw',
}

const logoStyle = {
    width: '4vw',
    height: '4vh',
}

const ProjectDisplay = ({image, description, tech, title}) => {

    console.log(image)

    return(
        <>
            <div style={gridLeft}>

                <div className="flex flex-wrap content-center">
                    
                    <h1>{title}</h1>
                    <hr />
                    <p>{description}</p>

                </div>


                <div className="flex justify-center items-center">
                    <figure style={imgStyle}>
                        <img src={image} alt="Project" className="rounded-md"  />
                        <figcaption className="flex items-center mx-10 justify-between pt-5 ">
                            {tech.map((logo, index) => (
                            <img src={logo} alt={`Tech Logo ${index + 1}`} key={index} style={logoStyle} />
                        ))}
                        </figcaption>
                    </figure>
                </div>



            </div>
        </>
    )


}

export default ProjectDisplay
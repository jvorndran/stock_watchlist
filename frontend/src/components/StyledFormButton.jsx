import React from "react";


export const StyledFormButton = ({text, type, onClickFunction}) => {
	return (
		<>
			<button
				type={type}
				onClick={(event) => onClickFunction(event)}
				className="align-middle rounded-3xl px-5 py-2 m-1 overflow-hidden relative group cursor-pointer border-2 font-medium border-black-steel text-indigo-600 text-white"
			>
				<span className="absolute w-64 h-0 transition-all duration-300 origin-center rotate-45 -translate-x-20 bg-black-steel top-1/2 group-hover:h-64 group-hover:-translate-y-32 ease"></span>
				<span className="relative text-black-steel font-semibold transition duration-300 group-hover:text-white ease">{text}</span>
			</button>
		</>
	)
}

export default StyledFormButton
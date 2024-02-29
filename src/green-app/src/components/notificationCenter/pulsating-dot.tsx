const PulsatingDot = () => {
  return (
    <div className="relative w-[15px] h-[15px] bg-primary rounded-[50%]">
      <div
        style={{
          animation: 'pulsatingDot 1s ease-out',
          animationIterationCount: 3,
          opacity: 0,
          top: '-50%',
          left: '-50%'
        }}
        className="absolute w-[30px] h-[30px] bg-primary rounded-full"
      />
    </div>
  )
}

export default PulsatingDot

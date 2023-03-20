import { Children, Fragment, ReactNode, useEffect, useState } from "react";
import { wrap } from "popmotion";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import CarouselButton from "./CarouselButton";

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

const swipeConfidenceThreshold = 10000;

const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const Carousel = ({
  children,
  noControls,
  onChange,
}: {
  children: ReactNode;
  noControls: boolean;

  /** Should be react callback. */
  onChange: (index: number) => void;
}) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const array = Children.toArray(children);
  const index = wrap(0, array.length, page);

  useEffect(() => {
    onChange(index);
  }, [index, onChange]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          className="absolute w-full"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        >
          {array[index]}
        </motion.div>
      </AnimatePresence>

      {!noControls && (
        <Fragment>
          <CarouselButton className="right-3" onClick={() => paginate(1)}>
            <ChevronRightIcon className="h-5 w-5" />
          </CarouselButton>

          <CarouselButton className="left-3" onClick={() => paginate(-1)}>
            <ChevronLeftIcon className="h-5 w-5" />
          </CarouselButton>
        </Fragment>
      )}
    </div>
  );
};

export default Carousel;

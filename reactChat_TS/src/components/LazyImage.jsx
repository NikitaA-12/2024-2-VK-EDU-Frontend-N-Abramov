import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const LazyImage = ({ src, alt, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={
        isVisible
          ? src
          : 'data:image/gif;base64,R0lGODlhEAAEAMQAAP///wAAAMDAwP///wAAACH5BAEAAAAALAAAAAAQABAAAAIThI8hAQA7'
      }
      alt={alt}
      className={className}
    />
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LazyImage;

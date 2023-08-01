import { useState, useEffect } from "react";

const useTruncatedString = (initialString: string, maxLength = 10) => {
  const [truncatedStr, setTruncatedStr] = useState("");

  useEffect(() => {
    if (initialString.length <= maxLength) {
      setTruncatedStr(initialString);
    } else {
      const frontPart = initialString.slice(0, maxLength);
      const backPart = initialString.slice(-maxLength);
      setTruncatedStr(`${frontPart}...${backPart}`);
    }
  }, [initialString, maxLength]);

  return truncatedStr;
};

export default useTruncatedString;

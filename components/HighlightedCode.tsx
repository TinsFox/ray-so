import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Language, LANGUAGES } from "../util/languages";

import styles from "../styles/Editor.module.css";
import { highlighterAtom, loadingLanguageAtom } from "../store";
import { useAtom, useSetAtom } from "jotai";

type PropTypes = {
  selectedLanguage: Language | null;
  code: string;
};

const HighlightedCode: React.FC<PropTypes> = ({ selectedLanguage, code }) => {
  const [highlighter] = useAtom(highlighterAtom);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const setIsLoadingLanguage = useSetAtom(loadingLanguageAtom);

  useEffect(() => {
    const generateHighlightedHtml = async () => {
      if (!highlighter || !selectedLanguage || selectedLanguage === LANGUAGES.plaintext) {
        return code.replace(/[\u00A0-\u9999<>\&]/g, (i) => `&#${i.charCodeAt(0)};`);
      }

      if (selectedLanguage === LANGUAGES.ansi) {
        return highlighter.codeToHtml(code, {
          lang: "ansi",
          theme: "css-variables",
        });
      }

      const loadedLanguages = highlighter.getLoadedLanguages() || [];
      const hasLoadedLanguage = loadedLanguages.includes(selectedLanguage.name.toLowerCase());

      if (!hasLoadedLanguage && selectedLanguage.src) {
        setIsLoadingLanguage(true);
        await highlighter.loadLanguage(selectedLanguage.src);
        setIsLoadingLanguage(false);
      }

      return highlighter.codeToHtml(code, {
        lang: selectedLanguage.name.toLowerCase(),
        theme: "css-variables",
      });
    };

    generateHighlightedHtml().then((newHtml) => {
      if (newHtml) {
        setHighlightedHtml(newHtml);
      }
    });
  }, [code, selectedLanguage, highlighter, setIsLoadingLanguage, setHighlightedHtml]);

  return (
    <div
      className={classNames(styles.formatted)}
      dangerouslySetInnerHTML={{
        __html: highlightedHtml,
      }}
    />
  );
};

export default HighlightedCode;

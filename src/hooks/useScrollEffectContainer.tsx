import { useRouter } from 'next/router';
import { RefObject, useEffect, useState } from 'react';

const paddingAccounting = 48;

const useScrollEffectContainer = ({containerRef}: {containerRef: RefObject<HTMLDivElement>}) => {
  const [currentSegment, setCurrentSegment] = useState("chat")
  const router = useRouter()
  useEffect(() => {
    const fullScreenElement = containerRef.current
    if (!fullScreenElement) return

    let initScroll = fullScreenElement.scrollTop
    const partialSectionToEnableScrollDown = fullScreenElement.clientHeight - fullScreenElement.clientHeight/10
    const partialSectionToEnableScrollUp = fullScreenElement.clientHeight/10 - fullScreenElement.clientHeight + paddingAccounting

    const scrollToSection = (id: string | undefined, el: Element) => {
      if (!id) {
        el.scrollIntoView({behavior: "smooth"})
      } 
      if (id && window.location.hash !== `#${id}`) {
        router.replace(`#${id}`)
      }
    }

    const handleScrollEnd = (e: Event) => {
      const isScrollDown = fullScreenElement.scrollTop > initScroll
      const isScrollUp = fullScreenElement.scrollTop < initScroll
      initScroll = fullScreenElement.scrollTop
      const children = fullScreenElement.children

      for (let i = 0; i < children.length; i++) {
        const currentChild = children[i]
        const id = currentChild.id
        const {top} = currentChild.getBoundingClientRect();
        
        if (isScrollDown) {
          if (top >= paddingAccounting && top < (partialSectionToEnableScrollDown - 400)) {
            // scrollToSection(id, currentChild)
            setCurrentSegment(id)
          }
        }
        else if (isScrollUp) {
          if (top <= paddingAccounting && top > (partialSectionToEnableScrollUp + 400)) {
            // scrollToSection(id, currentChild)
            setCurrentSegment(id)
          }
        }
        else {
          return
        }
      }
    }

    fullScreenElement.addEventListener("scrollend", (e: Event) => {
      handleScrollEnd(e)
    })
    return () => {
      fullScreenElement.removeEventListener("scrollend", (e: Event) => {
        handleScrollEnd(e)
      })
    }
  }, [containerRef])

  return currentSegment;
}

export default useScrollEffectContainer
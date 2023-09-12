import { ChangeEvent } from 'react';

export const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
};

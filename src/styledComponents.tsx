import styled from 'styled-components';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import trophyImage from './resources/trophy.svg';
import homeIcon from './resources/home-icon.png';

export const Container = styled.div`
  position: relative;
  z-index: 4;
  width: 100%;
  height: 100%;
`;

export const Title = styled.h1`
  font-size: 12rem;
  color: #fff;
  position: relative;
  z-index: 3;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  text-shadow: ${Array.from(new Array(4))
    .map((_, i) => `${i + 1}px 0 0 #ffe1cc`)
    .join(', ')};
  &::after {
    display: block;
    content: attr(title);
    color: #000;
    position: absolute;
    left: 2px;
    top: 0;
    z-index: -2;
    -webkit-text-stroke: 1.4rem #000;
    text-shadow: ${Array.from(new Array(8))
      .map((_, i) => `${i * 2 - 7}px ${i + 8}px 0 #000`)
      .join(', ')};
  }
`;

export const ButtonGroup = styled.div`
  position: absolute;
  bottom: 8rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  text-align: center;
  white-space: nowrap;
  color: #fff;
  font-size: 4rem;
  line-height: 1.5;
  text-shadow: 1px 1px 0 #000;
`;

export const TrophyButton = styled.button`
  position: absolute;
  right: 4rem;
  top: 4rem;
  background-image: url("${trophyImage}");
  background-size: 100%;
  background-repeat: no-repeat;
  width: 9rem;
  height: 9rem;
  z-index: 3;
  &::after {
    display: block;
    white-space: nowrap;
    content: attr(title);
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: .5rem;
    padding: 1rem;
    color: #fff;
    font-size: 3rem;
    position: absolute;
    top: 100%;
    left: 50%;
    opacity: 0;
    pointer-events: none;
    transition: 300ms all;
    transform: translate3d(-50%, -1rem, 0);
  }
  &:hover::after {
    opacity: 1;
    transform: translate3d(-50%, 1rem, 0);
  }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 50px;
  height: 109px;
  border: 5px solid #000;
  background-image: linear-gradient(to bottom, #f2a613, #ebc50f);
  font-size: 50px;
  color: #fff;
  -webkit-text-stroke: 2px #000;
  text-shadow: 3px 3px 0 #000;
  transition: all 300ms;
  overflow: hidden;
  &::after {
    display: block;
    position: absolute;
    content: '';
    height: 100%;
    top: 0;
    left: -3px;
    right: -3px;
    box-shadow: inset 0px -2.5px 0px 2.5px #a85131,
      inset 0px 2.5px 0 2.5px #f9ef85;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const HomeButton = styled(Button)`
  &::before {
    width: 50px;
    height: 43px;
    background-image: url("${homeIcon}");
    background-size: 100% 100%;
    display: inline-block;
    content: "";
    vertical-align: middle;
    margin-right: 15px;
  }
`;

export const RankingModal = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 200;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const Modal = ({ children }: React.PropsWithChildren<{}>) => {
  return ReactDOM.createPortal(
    <RankingModal>{children}</RankingModal>,
    document.getElementById('modal')!
  );
};

export const ToastMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 5rem;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 0.5rem;
  color: #fff;
  z-index: 999;
  pointer-events: none;
`;

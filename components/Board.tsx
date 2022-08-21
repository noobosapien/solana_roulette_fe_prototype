import React, { useState } from "react";
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { FC } from 'react';

const Board = ({ selected, setSelected }: {selected: number, setSelected: Function}) => {


    const redBlock = "text-7xl text-white bg-red-600 transition-colors rounded-lg";
    const blackBlock = "text-7xl text-white bg-zinc-800 rounded-lg";
    const greenBlock = "text-7xl text-white bg-emerald-600 transition-colors rounded-lg";

    const onClick = (num: number) => () => {
        setSelected(num);
    }

    return <>
        <div className="flex flex-col space-y-8">
            <div className="flex flex-row justify-evenly space-x-8">
                <div onClick={onClick(1)} className={selected === 1 ? greenBlock : redBlock} style={{padding: '50px'}}>01</div>
                <div onClick={onClick(2)} className={selected === 2 ? greenBlock : blackBlock} style={{padding: '50px'}}>02</div>
                <div onClick={onClick(3)} className={selected === 3 ? greenBlock : redBlock} style={{padding: '50px'}}>03</div>
            </div>

            <div className="flex flex-row justify-evenly space-x-8">
                <div onClick={onClick(4)} className={selected === 4 ? greenBlock : blackBlock} style={{padding: '50px'}}>04</div>
                <div onClick={onClick(5)} className={selected === 5 ? greenBlock : redBlock} style={{padding: '50px'}}>05</div>
                <div onClick={onClick(6)} className={selected === 6 ? greenBlock : blackBlock} style={{padding: '50px'}}>06</div>
            </div>

            <div className="flex flex-row justify-evenly space-x-8">
                <div onClick={onClick(7)} className={selected === 7 ? greenBlock : redBlock} style={{padding: '50px'}}>07</div>
                <div onClick={onClick(8)} className={selected === 8 ? greenBlock : blackBlock} style={{padding: '50px'}}>08</div>
                <div onClick={onClick(9)} className={selected === 9 ? greenBlock : redBlock} style={{padding: '50px'}}>09</div>
            </div>

            <div className="flex flex-row justify-evenly space-x-8">
                <div onClick={onClick(10)} className={selected === 10 ? greenBlock : blackBlock} style={{padding: '50px'}}>10</div>
                <div onClick={onClick(11)} className={selected === 11 ? greenBlock : redBlock} style={{padding: '50px'}}>11</div>
                <div onClick={onClick(12)} className={selected === 12 ? greenBlock : blackBlock} style={{padding: '50px'}}>12</div>
            </div>
        </div>
    </>
}


export default Board;

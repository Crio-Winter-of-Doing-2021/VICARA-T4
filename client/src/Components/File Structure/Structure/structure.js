import React,{useEffect} from 'react'
import {useDispatch,useSelector} from 'react-redux'
import NavigationTabs from '../NavigationTabs/navigation'
import {updateStructure,structureAsync,selectStructure} from '../../../store/slices/structureSlice'

export default function Structure() {
    const structureState = useSelector(selectStructure)
    const dispatch = useDispatch()
    useEffect(()=>{
        dispatch(structureAsync())
    },[])

    return (
        <div>
            <NavigationTabs/>
        </div>
    )
}


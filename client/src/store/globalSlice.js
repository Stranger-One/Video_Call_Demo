import { createSlice } from "@reduxjs/toolkit";

const globalSlice = createSlice({
    name: "global",
    initialState: {
        allRoomUsers: []
    },
    reducers: {
        setAllRoomUsers: (state, action)=>{
            state.allRoomUsers = action.payload;
        }
    }
})

export const {setAllRoomUsers} = globalSlice.actions;
export default globalSlice.reducer;
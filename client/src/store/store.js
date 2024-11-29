import {configureStore} from '@reduxjs/toolkit'
import globalSlice from "./globalSlice.js"

const store = configureStore({
    reducer: {
        global: globalSlice
    }
})

export default store;
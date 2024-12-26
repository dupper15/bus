import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   _id: '',
   id: '',
   name: '',
   username: '',
   password: '',
   id_card: '',
   image: ' ',
   access_token: ''
}

export const accountSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        updateAccount: (state, action) => {
            const { _id = '', id= ' ', name='', username = '', password='', id_card='', image='',access_token='' } = action.payload
            state._id = _id;
            state.id = id;
            state.name = name;
            state.username = username;
            state.password = password;
            state.image = image;
            state.id_card = id_card;
            state.access_token = access_token
        },
        resetAccount: (state) => {
            state._id = '';
            state.id = '';
            state.name = '';
            state.username = '';
            state.password = '';
            state.image = '';
            state.id_card = '';
            state.access_token = ''
        }
    }
})

export const { updateAccount , resetAccount } = accountSlice.actions

export default accountSlice.reducer
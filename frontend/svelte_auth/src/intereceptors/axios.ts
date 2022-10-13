import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000/api/";

let refresh = false;

axios.interceptors.response.use(resp => resp, async error => {
    console.log('error', error)
    if (error.response?.status === 401 && !refresh) {
        refresh = true;
        const {data, status} = await axios.post('refresh', {}, {withCredentials: true});
        if (status === 200) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
            
            const userdata  = await axios.get('http://localhost:8000/api/user')
        return userdata;
        }


    }

    refresh = false;
    return error;
});
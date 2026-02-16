const API_BASE="http://localhost:3000";

async function request(path,options={}){
    try{
        const res=await fetch(`${API_BASE}${path}`,{
            credentials:"include",
            headers:{
                "Content-Type":"application/json",
                ...(options.headers||{}),
            },
            ...options,
        });

        if(res.status===401){
            return {unauthorized:true};
        }

        const contentType=res.headers.get("content-type");

        if(!contentType||!contentType.includes("application/json")){
            throw new Error("Server did not return JSON")
        }
        
        return await res.json();

    }catch(err){
        console.error("API error:",err);
        throw err;
    }
}

    const api={
        get:(path)=>request(path),

        post:(path,body)=>
            request(path,{
                method:"POST",
                body:JSON.stringify(body),
            }),

            put:(path,body)=>
                request(path,{
                    method:"PUT",
                    body:JSON.stringify(body),
                }),

                delete:(path)=>
                    request(path,{
                        method:"DELETE",
                    }),

                    postForm:(path,formData)=>
                        request(path,{
                            method:"POST",
                            body:formData,
                            headers:{},//let browser set multipart boundary
                        }),

                        putForm:(path,formData)=>
                            request(path,{
                                method:"PUT",
                                body:formData,
                                headers:{},
                            }),
    };

    export default api;

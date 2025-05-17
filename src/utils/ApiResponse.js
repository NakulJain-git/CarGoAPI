class ApiResponse{
    constructor(message="Success",data,statusCode){
        this.data=data,
        this.statusCode = statusCode
        this.sucess=statusCode<400
        this.message=message

    }
}
export{ApiResponse}
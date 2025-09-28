// class ApiError extends Error{
//     constructor(
//         statusCode,
//         message = "Something went wrong",
//         error =[],
//         stack =""
//     ){
//         super(message)
//         this.statusCode = statusCode
//         this.data = null
//         this.message = message
//         this.success = false;
//         this.errors = errors

//         if(stack){
//             this.stack = stack
//         }else{
//             Error.captureStackTrace(this.this.constructor)
//         }
//     }
// }

// export {ApiError}


class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [], // Changed from 'error' to 'errors'
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors // Now matches parameter name

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor) // Fixed: removed extra 'this'
        }
    }
}

export {ApiError}
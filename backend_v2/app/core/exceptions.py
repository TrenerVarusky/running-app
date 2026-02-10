from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

def register_exception_handlers(app):
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ):
        for error in exc.errors():
            if error["loc"][-1] == "email":
                return JSONResponse(
                    status_code=400,
                    content={"message": "Nieprawidłowy adres e-mail"}
                )

        return JSONResponse(
            status_code=400,
            content={"message": "Nieprawidłowe dane wejściowe"}
        )

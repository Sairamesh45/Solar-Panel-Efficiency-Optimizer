from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict
import importlib.util
import pathlib

# Load predict_service.py from the machine-learning folder (handles hyphenated folder name)
predict_path = pathlib.Path(__file__).parent / "machine-learning" / "predict_service.py"
spec = importlib.util.spec_from_file_location("predict_service", str(predict_path))
predict_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(predict_module)
predict_solar_output = predict_module.predict_solar_output

app = FastAPI(title="Solar ML API")


class InputModel(BaseModel):
    __root__: Dict[str, Any]


@app.post("/predict")
def predict(payload: InputModel):
    data = payload.__root__
    result = predict_solar_output(data)
    return result

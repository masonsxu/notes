"""API 请求/响应 Pydantic 模型。"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """单样本预测请求。feature_names 由 /api/info 返回。"""
    features: dict[str, float | int] = Field(
        ..., description="特征名到数值的映射,需与训练时一致")


class ClassScore(BaseModel):
    class_index: int
    class_name: str
    probability: float


class PredictResponse(BaseModel):
    predicted_class: int
    predicted_class_name: str
    probabilities: list[ClassScore]
    top_features: list[dict] = Field(
        default_factory=list,
        description="对该预测贡献最大的特征(SHAP 局部解释,可选)")


class ModelInfo(BaseModel):
    model_type: str
    objective: str
    num_class: int
    class_names: list[str]
    feature_names: list[str]
    feature_schema: list[dict]
    n_features: int
    best_iteration: Optional[int] = None
    test_metrics: Optional[dict] = None
    created_at: Optional[str] = None

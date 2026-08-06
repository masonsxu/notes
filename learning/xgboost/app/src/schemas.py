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


class ModelVersionSummary(BaseModel):
    version_id: str
    created_at: Optional[str] = None
    is_active: bool = False
    model_type: Optional[str] = None
    objective: Optional[str] = None
    num_class: Optional[int] = None
    n_features: Optional[int] = None
    class_names: list[str] = Field(default_factory=list)
    best_iteration: Optional[int] = None
    n_train_samples: Optional[int] = None
    best_params: dict = Field(default_factory=dict)
    metrics: dict = Field(default_factory=dict)


class ModelListResponse(BaseModel):
    active_version_id: Optional[str] = None
    versions: list[ModelVersionSummary]


class SwitchRequest(BaseModel):
    version_id: str = Field(..., description="目标版本 ID(YYYYMMDD_HHMMSS)")


class SwitchResponse(BaseModel):
    version_id: str
    feature_names: list[str]
    class_names: list[str]
    num_class: int


class DatasetSummary(BaseModel):
    name: str
    n_rows: int
    n_features: int
    feature_names: list[str]
    class_distribution: dict[int, int] = Field(
        default_factory=dict, description="类别标签 → 样本数")
    size_bytes: int


class DatasetListItem(BaseModel):
    name: str
    size_bytes: int
    created_at: str


class DatasetListResponse(BaseModel):
    datasets: list[DatasetListItem]


class TrainRequest(BaseModel):
    dataset_name: str = Field(..., description="data/uploads/ 下的 CSV 文件名")
    trials: Optional[int] = Field(
        None, ge=1, le=200, description="Optuna 试验次数;不传则用默认(5)")


class TrainResponse(BaseModel):
    new_version_id: str
    num_class: int
    n_rows: int
    accuracy: Optional[float] = None
    f1_macro: Optional[float] = None
    roc_auc_ovr: Optional[float] = None
    elapsed_seconds: float


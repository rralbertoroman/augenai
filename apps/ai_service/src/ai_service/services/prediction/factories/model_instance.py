from abc import ABC, abstractmethod


class ModelInstance(ABC):
    @abstractmethod
    def __init__(self):
        pass

    @abstractmethod
    def run(self, image):
        pass

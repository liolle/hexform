from typing import Any

class Result():
    _success:bool
    _keys:dict[str,Any]

    @property
    def success(self):
        return self._success

    @property
    def keys(self):
        return self._keys


    def __init__(self, success:bool, keys:dict[str,Any] = {}) -> None:
        self._success = success
        self._keys = keys
        pass

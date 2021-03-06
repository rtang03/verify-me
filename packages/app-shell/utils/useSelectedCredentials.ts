import { useState, useEffect, useCallback } from 'react';

interface ValidationState {
  [index: string]: {
    required: boolean;
    vc:  any;
  };
}

export const useSelectedCredentials = (sdr: any) => {
  const [selected, setSelected] = useState<ValidationState>({});
  const [valid, setValid] = useState<boolean>(true);

  const onSelect = (vc: string | null, claimType: string) => {
    const newState = {
      ...selected,
      [claimType]: { ...selected[claimType], vc },
    };

    setSelected(newState);
  };

  const checkValidity = useCallback(() => {
    let valid = true;
    Object.keys(selected).map((key) => {
      if (selected[key].required && !selected[key].vc) {
        valid = false;
      }
      return key;
    });
    setValid(valid);
  }, [selected]);

  useEffect(() => {
    checkValidity();
  }, [selected, checkValidity]);

  useEffect(() => {
    if (sdr) {
      const defaultSelected: ValidationState = {};
      sdr.map((sdr: any) => {
        if (sdr && sdr.essential) {
          if (sdr.credentials.length) {
            defaultSelected[sdr.claimType] = {
              required: true,
              vc: sdr.credentials[0],
              // vc: sdr.credentials[0].credentialSubject[sdr.claimType],
            };
          } else {
            defaultSelected[sdr.claimType] = {
              required: true,
              vc: null,
            };
            setValid(false);
          }
        }
        return sdr;
      });
      setSelected(defaultSelected);
    }
  }, [sdr]);

  return { selected, valid, onSelect };
};

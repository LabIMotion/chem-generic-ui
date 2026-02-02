/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import cloneDeep from 'lodash/cloneDeep';
import { downloadFile, FieldTypes } from 'generic-ui-core';
import GenInterface from '@components/details/GenInterface';
import Constants from '@components/tools/Constants';
import { responseExt } from '@utils/template/action-handler';
import { notifySuccess } from '@utils/template/designer-message';
import VersionBlock from '@components/designer/preview/VersionBlock';
import CompareModal from '@components/designer/preview/CompareModal';
import CompareButton from '@components/designer/preview/CompareButton';
import FullScreenToggle from '@components/designer/preview/FullScreenToggle';
import ContributeTemplateButton from '@components/designer/preview/ContributeTemplateButton';
import PreviewNote from '@/components/designer/preview/PreviewNote';
import ContributeTemplateModal from '@components/designer/preview/ContributeTemplateModal';
import { buildString } from '@utils/pureUtils';
import VerManager from '@utils/verMgr';

// Configuration constants
const PREVIEW_CONFIG = {
  MAX_REVISIONS_DISPLAY: 10,
  DEFAULT_COMPARE_UUID: 'none',
  LAYOUT: {
    REVISION_LIST_COLS: 4,
    PREVIEW_COLS_NORMAL: 8,
    PREVIEW_COLS_FULLSCREEN: 12,
    MIN_PREVIEW_HEIGHT: '50vh',
  },
  SOURCES: {
    PROPERTIES: 'properties',
    PROPERTIES_RELEASE: 'properties_release',
  },
};

// API action mappings for different source types
const API_ACTIONS = {
  [PREVIEW_CONFIG.SOURCES.PROPERTIES]: {
    fetch: 'revisions',
    delete: 'deleteRevision',
  },
  [PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE]: {
    fetch: 'klassRevisions',
    delete: 'deleteKlassRevision',
  },
};

// Parameter builders for different API endpoints
const buildApiParams = (src, data, type) => {
  switch (src) {
    case PREVIEW_CONFIG.SOURCES.PROPERTIES:
      return { id: data.id, type: type.toLowerCase() };
    case PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE:
      return { id: data.id, klass: `${type}Klass` };
    default:
      return {};
  }
};

const buildDeleteParams = (src, data, type, params) => {
  switch (src) {
    case PREVIEW_CONFIG.SOURCES.PROPERTIES:
      return {
        id: params.id,
        element_id: data.id,
        klass: type,
      };
    case PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE:
      return {
        id: params.id,
        klass_id: data.id,
        klass: `${type}Klass`,
      };
    default:
      return {};
  }
};

// Data transformation functions
const prepareRevisions = (src, list, data) => {
  if (src === PREVIEW_CONFIG.SOURCES.PROPERTIES) {
    return (list || []).map((r) => ({
      ...r,
      released_at: r.created_at,
    }));
  }

  // For properties_release, include current template as first revision
  const currentRevision = {
    metadata: { ...data.metadata },
    properties_release: { ...data.properties_template },
    uuid: data.properties_template.uuid,
    version: data.properties_template.version,
    klass_id: data.id,
    id: 0,
  };

  return [currentRevision, ...(list || [])];
};

// Initialize the compareUUID based on the source type and data
const getInitialCompareUUID = (src, data) => {
  if (
    src === PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE &&
    data?.properties_template
  ) {
    return buildString([
      data.properties_template.uuid,
      data.properties_template.id || 0,
    ]);
  }
  return PREVIEW_CONFIG.DEFAULT_COMPARE_UUID;
};

const PreviewFunctional = ({
  genericType,
  data = {},
  refSource = { currentUser: {} },
  fnRetrieve = () => {},
  src = PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE,
  canDL = false,
}) => {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisions, setSelectedRevisions] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [compareUUID, setCompareUUID] = useState(() =>
    getInitialCompareUUID(src, data),
  );
  const [fullScreen, setFullScreen] = useState(false);

  const fetchRevisions = () => {
    if (data?.id) {
      VerManager[API_ACTIONS[src].fetch](
        buildApiParams(src, data, genericType),
      ).then((response) => {
        if (response.notify.isSuccess) {
          setRevisions(
            prepareRevisions(
              src,
              response.element?.data?.revisions || [],
              data,
            ),
          );
        }
      });
    }
  };

  const delRevision = useCallback(
    (params) => {
      VerManager[API_ACTIONS[src].delete](
        buildDeleteParams(src, data, genericType, params),
      ).then((response) => {
        if (response.notify.isSuccess) {
          fetchRevisions();
        }
      });
    },
    [src, data],
  );

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleChanged = useCallback(
    (el) => {
      let selected = (revisions || []).find(
        (r) => buildString([r.uuid, r.id]) === compareUUID,
      );
      if (selected && selected[src]) {
        selected = el;
        setRevisions([...revisions]);
      }
    },
    [compareUUID, revisions, src],
  );

  const compare = useCallback(
    (params) => {
      setCompareUUID(buildString([params.uuid, params.id]));
    },
    [revisions],
  );

  const retrieveRevision = useCallback(
    (params) => {
      const deep = cloneDeep(revisions.find((r) => r.id === params.id));
      if (src === PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE) {
        data.properties_template = deep[src];
        data.metadata = deep.metadata;
        fnRetrieve(responseExt(notifySuccess(), data, { active: 'w' }));
      } else {
        fnRetrieve({ metadata: deep.metadata, [src]: deep[src] }, () => {});
      }
    },
    [fnRetrieve, revisions, src, data],
  );

  const dlRevision = useCallback(
    (params) => {
      const revision = revisions.find((r) => r.id === params.id);
      const exportData = cloneDeep(revision.properties_release);
      exportData.klass = revision.properties_release.klass;
      exportData.released_at = revision.released_at || '';
      exportData.metadata = revision.metadata || {};

      const href = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData),
      )}`;
      downloadFile({
        contents: href,
        name: `${exportData.klass}_${data.label}_${revision.uuid}.json`,
      });
    },
    [data, revisions],
  );

  const handleSelectionChange = useCallback(
    (revision, isSelected, { verID, verBase }) => {
      setSelectedRevisions((prev) => {
        if (isSelected) {
          // Add revision if not already selected (limit to 2)
          if (
            prev.length < 2 &&
            !prev.some(
              (r) =>
                buildString([r.uuid, r.id]) ===
                buildString([revision.uuid, revision.id]),
            )
          ) {
            return [
              ...prev,
              {
                ...revision[src],
                // Preserve revision identifiers for comparison
                uuid: revision.uuid,
                id: revision.id,
                // Store the ver info for headers
                _versionDisplay: { verID, verBase } || 'Unknown Version',
              },
            ];
          }
          return prev;
        } else {
          // Remove revision
          return prev.filter((r) => {
            const currentId = buildString([r.uuid, r.id]);
            const revisionId = buildString([revision.uuid, revision.id]);
            return currentId !== revisionId;
          });
        }
      });
    },
    [src],
  );

  const handleCompareClick = useCallback(() => {
    setShowCompareModal(true);
  }, []);

  const isRevisionSelected = useCallback(
    (revision) => {
      return selectedRevisions.some((r) => {
        const selectedId = buildString([r.uuid, r.id]);
        const revisionId = buildString([revision.uuid, revision.id]);
        return selectedId === revisionId;
      });
    },
    [selectedRevisions],
  );

  const toggleScreen = useCallback(() => {
    setFullScreen((prev) => !prev); // safer toggle
  }, []);

  const handleContributeTemplate = useCallback(() => {
    setShowContributeModal(true);
  }, []);

  const handleSubmitSuccess = useCallback(() => {
    // Refresh revisions from DB to get updated data (including submitted flag)
    // The compareUUID will ensure the same revision remains selected
    fetchRevisions();
  }, []);

  // Early return if no revisions
  if (revisions.length < 1) return null;

  const options = [];
  const selected =
    (revisions || []).find(
      (r) => buildString([r.uuid, r.id]) === compareUUID,
    ) || {};
  const selectOptions =
    (selected && selected[src] && selected[src].select_options) || {};

  // Calculate submission status text
  const submittedCount = selected.submitted || 0;
  const getSubmissionText = () => {
    if (submittedCount === 0) return '';
    if (submittedCount === 1) return '(1 time)';
    return `(${submittedCount} times)`;
  };

  if (selected.name) {
    options.push({
      generic: selected,
      type: FieldTypes.F_TEXT,
      isEditable: true,
      isRequire: false,
      field: 'name',
    });
  }

  selected[src] = selected[src] || {};
  selected[src].layers = selected[src].layers || {};
  if (src === PREVIEW_CONFIG.SOURCES.PROPERTIES) {
    selected.properties_release = { select_options: selectOptions };
  } else {
    selected.properties = selected.properties_release;
  }

  const layersLayout = (
    <GenInterface
      generic={selected || {}}
      fnChange={handleChanged}
      extLayers={options}
      genId={selected.uuid || 0}
      isPreview={src === PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE}
      editMode={src === PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE}
      isActiveWF={false}
      genericType={genericType}
    />
  );

  return (
    <Row className="g-0">
      {!fullScreen && (
        <Col md={PREVIEW_CONFIG.LAYOUT.REVISION_LIST_COLS}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <b>
              Only show the latest {PREVIEW_CONFIG.MAX_REVISIONS_DISPLAY}{' '}
              revisions.
            </b>
            <CompareButton
              onClick={handleCompareClick}
              disabled={selectedRevisions.length !== 2}
              selectedCount={selectedRevisions.length}
            />
          </div>
          {revisions.map((rev, idx) => (
            <VersionBlock
              key={buildString([rev.uuid, rev.id])}
              data={data}
              download={{ canDL, fnDownload: dlRevision }}
              idxSelect={`${idx}:${compareUUID}`}
              rev={rev}
              src={src}
              fnDelete={delRevision}
              fnRetrieve={retrieveRevision}
              fnView={compare}
              isSelected={isRevisionSelected(rev)}
              onSelectionChange={handleSelectionChange}
            />
          ))}
        </Col>
      )}
      <Col
        md={
          fullScreen
            ? PREVIEW_CONFIG.LAYOUT.PREVIEW_COLS_FULLSCREEN
            : PREVIEW_CONFIG.LAYOUT.PREVIEW_COLS_NORMAL
        }
      >
        <div className="d-flex align-items-center justify-content-between ms-1 mb-2">
          <div className="d-flex align-items-center">
            <div className="me-2">
              {selected.version && selected.released_at && (
                <Badge bg="info" className="fs-6">
                  {`v${selected.version}`}
                </Badge>
              )}
              {!selected.version && <span />}
            </div>
            {src === PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE && <PreviewNote />}
          </div>
          <div className="d-flex align-items-center">
            <ContributeTemplateButton
              onClick={handleContributeTemplate}
              disabled={
                !selected.id || !selected.version || !refSource.currentUser?.id
              }
              text={getSubmissionText()}
            />
            <FullScreenToggle
              isFullScreen={fullScreen}
              onToggle={toggleScreen}
            />
          </div>
        </div>
        {Object.keys(selected).length !== 0 && (
          <div
            style={{
              width: '100%',
              minHeight: PREVIEW_CONFIG.LAYOUT.MIN_PREVIEW_HEIGHT,
            }}
          >
            {layersLayout}
          </div>
        )}
      </Col>
      <CompareModal
        showProps={{
          show: showCompareModal,
          setShow: setShowCompareModal,
        }}
        selectedRevisions={selectedRevisions}
      />
      <ContributeTemplateModal
        showProps={{
          show: showContributeModal,
          setShow: setShowContributeModal,
        }}
        data={selected}
        currentUser={refSource.currentUser}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </Row>
  );
};

PreviewFunctional.propTypes = {
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  data: PropTypes.object,
  fnRetrieve: PropTypes.func,
  canDL: PropTypes.bool,
  src: PropTypes.oneOf([
    PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE,
    PREVIEW_CONFIG.SOURCES.PROPERTIES,
  ]),
};

PreviewFunctional.defaultProps = {
  data: {},
  fnRetrieve: () => {},
  src: PREVIEW_CONFIG.SOURCES.PROPERTIES_RELEASE,
  canDL: false,
};

export default PreviewFunctional;

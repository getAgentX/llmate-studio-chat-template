import React, { useState, useEffect, useCallback, useRef } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetRender from "./WidgetRender";
import { useDashboardContext } from "@/context/DashboardContext";
import { useUpdateWidgetsPositionMutation } from "@/store/dashboard";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

// Initialize layout based on widgets
const getInitialLayout = (widgets) =>
  widgets.map((widget) => ({
    i: widget.id,
    x: widget.position?.x || 0,
    y: widget.position?.y || 0,
    w: widget.position?.w || 2,
    h: widget.position?.h || 4,
    // minH: 4, // Uncomment if minimum height is needed
  }));

const DashboardSection = ({ data, dashboard_id, onSectionRefresh }) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState(false);
  const [firstRender, setFirstRender] = useState(false);

  const { setShowAddWidget, setCurrentOutput } = useDashboardContext();
  const [updateWidgetsPosition, { data: updateData, isLoading }] =
    useUpdateWidgetsPositionMutation();

  const contentRefs = useRef({});

  // Initialize layouts on mount or when data changes
  // useEffect(() => {
  //   if (data && data.widgets) {
  //     const initialLayout = getInitialLayout(data.widgets);
  //     setLayouts({
  //       lg: initialLayout,
  //       md: initialLayout,
  //       sm: initialLayout,
  //       xs: initialLayout,
  //       xxs: initialLayout,
  //     });
  //     setMounted(true);
  //   }
  // }, [data]);

  // Handle breakpoint changes
  const onBreakpointChange = useCallback((breakpoint) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  // Handle layout changes
  const onLayoutChange = useCallback(
    (layout, allLayouts) => {
      setLayouts(allLayouts);

      // Prepare payload for updating widget positions

      if (firstRender) {
        setFirstRender(false);
        return;
      }

      const payload = layout.reduce((acc, item) => {
        acc[item.i] = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
        return acc;
      }, {});

      setCurrentOutput(payload);
      updateWidgetsPosition({
        dashboard_id,
        section_id: data.id,
        payload,
      });
    },
    [dashboard_id, data.id, setCurrentOutput, updateWidgetsPosition]
  );

  // Adjust widget height based on content
  const adjustHeightBasedOnContent = useCallback(
    (id) => {
      const contentHeight = contentRefs.current[id]?.clientHeight;
      const rowHeight = 70; // Must match the grid's rowHeight
      const calculatedHeight = Math.ceil(contentHeight / rowHeight);

      setLayouts((prevLayouts) => {
        if (!prevLayouts) return prevLayouts;
        const updatedLayout = prevLayouts[currentBreakpoint].map((layout) =>
          layout.i === id ? { ...layout, h: calculatedHeight } : layout
        );
        return { ...prevLayouts, [currentBreakpoint]: updatedLayout };
      });
    },
    [currentBreakpoint]
  );

  // Generate grid items
  const generateDOM = () => {
    if (data.widgets.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full text-xs font-medium text-white ">
          <button
            type="button"
            className="flex items-center space-x-2 hover:text-white group"
            onClick={() => setShowAddWidget(true)}
          >
            <span>
              <svg
                viewBox="0 0 15 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-white/50 group-hover:fill-white"
              >
                <path d="M6.5 8H0.5V6H6.5V0H8.5V6H14.5V8H8.5V14H6.5V8Z" />
              </svg>
            </span>
            <span>Add Widget</span>
          </button>
        </div>
      );
    }

    return data.widgets.map((widgetItem) => (
      <div
        key={widgetItem.id}
        className="bg-[#181818] text-white rounded-md "
        ref={(el) => (contentRefs.current[widgetItem.id] = el)}
        onLoad={() => adjustHeightBasedOnContent(widgetItem.id)}
      >
        <div className="w-full h-full">
          <WidgetRender
            dashboard_id={dashboard_id}
            section_id={data.id}
            widgetData={widgetItem}
            onWidgetRefresh={onSectionRefresh}
          />
        </div>
      </div>
    ));
  };

  // Loading indicator
  // if (!mounted || !layouts) {
  //   return (
  //     <div className="flex items-center justify-center w-full min-h-full rounded-md bg-page">
  //       <svg
  //         aria-hidden="true"
  //         className="w-6 h-6 animate-spin text-border fill-[#295EF4]"
  //         viewBox="0 0 100 101"
  //         fill="none"
  //         xmlns="http://www.w3.org/2000/svg"
  //       >
  //         <path
  //           d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
  //           fill="currentColor"
  //         />
  //         <path
  //           d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
  //           fill="currentFill"
  //         />
  //       </svg>
  //       <span className="sr-only">Loading...</span>
  //     </div>
  //   );
  // }

  if (data.widgets.length === 0) {
    return (
      <div className="px-4 py-4">
        <div className="flex flex-col items-center w-full py-12 mx-auto border rounded-md border-border-color bg-page">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="var(--icon-secondary-bg)" />
            <path d="M24.65 20.9992L19 15.3492L24.65 9.69922L30.3 15.3492L24.65 20.9992ZM11 18.9992V10.9992H19V18.9992H11ZM21 28.9992V20.9992H29V28.9992H21ZM11 28.9992V20.9992H19V28.9992H11Z" fill='var(--icon-fill-color-disabled)' />
          </svg>

          <p className="text-lg font-medium text-primary-text mt-2">
            Let’s Create Your First Widget
          </p>

          <p className="w-full max-w-lg mx-auto text-base font-normal text-center text-secondary-text">
            Add widgets and visualise your data
          </p>

          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center justify-center h-8 px-3 space-x-2 text-xs font-bold tracking-wide rounded-md text-btn-primary-text whitespace-nowrap bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disable disabled:to-btn-primary-disable-text mt-2"
          >
            <span className="flex items-center justify-center">
              <svg
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 fill-btn-primary-icon"
              >
                <path d="M4.33203 5.66634H0.332031V4.33301H4.33203V0.333008H5.66536V4.33301H9.66536V5.66634H5.66536V9.66634H4.33203V5.66634Z" />
              </svg>
            </span>
            <span className="hidden xsm:block">Add Widget</span>
            <span className="xsm:hidden">Add</span>
          </button>
        </div>
      </div>
    );
  }

  const initialLayout = getInitialLayout(data.widgets);

  return (
    <div className="w-full min-h-full rounded-md bg-page-light ">
      <ResponsiveReactGridLayout
        className="layout"
        layouts={{
          lg: initialLayout,
          md: initialLayout,
          sm: initialLayout,
          xs: initialLayout,
          xxs: initialLayout,
        }}
        onBreakpointChange={onBreakpointChange}
        onLayoutChange={onLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={mounted}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 2, xxs: 1 }}
        rowHeight={70}
      >
        {generateDOM()}
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default DashboardSection;
